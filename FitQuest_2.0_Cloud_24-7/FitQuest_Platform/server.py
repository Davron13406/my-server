import os, re, math, json, uuid
from datetime import datetime, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from functools import wraps
from flask import Flask, request, jsonify, session, send_from_directory
from flask_session import Session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row
import bcrypt

BASE = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.getenv("PORT", "3000"))
ENV = os.getenv("NODE_ENV", "development")
SECRET = os.getenv("SESSION_SECRET", "")
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("Не задан DATABASE_URL. Создай .env по образцу .env.example.")
if len(SECRET) < 32:
    if ENV == "production":
        raise RuntimeError("В production SESSION_SECRET должен содержать минимум 32 символа.")
    print("ВНИМАНИЕ: задай SESSION_SECRET перед публикацией в интернете.")

app = Flask(__name__, static_folder="public")
app.secret_key = SECRET or "local-development-secret-change-before-publishing"
app.config.update(
    SESSION_TYPE="filesystem", SESSION_FILE_DIR=os.path.join(BASE, ".sessions"),
    SESSION_PERMANENT=False, SESSION_USE_SIGNER=True,
    SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=(ENV == "production"), MAX_CONTENT_LENGTH=1024*1024
)
Session(app)
limiter = Limiter(get_remote_address, app=app, default_limits=[])
pool = ConnectionPool(DATABASE_URL, min_size=1, max_size=int(os.getenv("DB_POOL_SIZE","10")),
                      kwargs={"row_factory": dict_row}, open=True)

SHOP = {
'theme-lime':(0,'theme'),'theme-ocean':(120,'theme'),'theme-sunset':(160,'theme'),
'theme-violet':(200,'theme'),'theme-cyberpunk':(280,'theme'),'avatar-rocket':(0,'avatar'),
'avatar-comet':(0,'avatar'),'theme-mint':(0,'theme'),'avatar-star':(90,'avatar'),
'avatar-dragon':(150,'avatar'),'course-back':(240,'course'),'course-posture':(220,'course'),
'course-splits':(260,'course'),'course-endurance':(320,'course'),'course-strength':(300,'course'),
'marathon-7day':(300,'marathon'),'mealplan-week':(180,'mealplan'),'streak-freeze':(100,'streakFreeze'),
'voice-calm':(100,'voice'),'voice-energy':(130,'voice'),'voice-commander':(150,'voice')}
PROGRAMS = {
'activation-7':('7 дней движения',7,None),'back-7':('Здоровая спина · 7 дней',7,'course-back'),
'posture-7':('Курс по осанке · 7 дней',7,'course-posture'),'flexibility-14':('Гибкость · 14 дней',14,'course-splits'),
'endurance-30':('Выносливость · 30 дней',30,'course-endurance'),'strength-14':('Сила и техника · 14 дней',14,'course-strength')}
def db_exec(sql, params=(), one=False, all=False):
    with pool.connection() as c:
        with c.cursor() as cur:
            cur.execute(sql, params)
            if one: return cur.fetchone()
            if all: return cur.fetchall()
            if cur.description: return cur.fetchone()
def error(message, status=400): return jsonify(error=message), status
def current_user():
    uid=session.get("user_id")
    return db_exec("SELECT id,email,nick FROM users WHERE id=%s",(uid,),one=True) if uid else None
def login_required(fn):
    @wraps(fn)
    def wrapped(*a,**kw):
        user=current_user()
        if not user:
            session.clear(); return error("Требуется вход в аккаунт.",401)
        request.user=user
        return fn(*a,**kw)
    return wrapped
def local_day(tz):
    try: return datetime.now(ZoneInfo(tz or "UTC")).date().isoformat()
    except (ZoneInfoNotFoundError,TypeError): return datetime.now(timezone.utc).date().isoformat()
def state(uid):
    row=db_exec("SELECT * FROM player_state WHERE user_id=%s",(uid,),one=True)
    if not row: return None
    today=local_day((row.get("settings") or {}).get("timezone","UTC"))
    tasks=db_exec("SELECT task_id,day_key,coins_awarded,xp_awarded FROM completed_tasks WHERE user_id=%s ORDER BY completed_at DESC LIMIT 100",(uid,),all=True)
    workouts=db_exec("SELECT id,activity_type,duration_minutes,note,local_day,xp_awarded,coins_awarded,logged_at FROM workout_logs WHERE user_id=%s ORDER BY logged_at DESC LIMIT 30",(uid,),all=True)
    return {"user":dict(request_user(uid)),"player":row,"completedTasks":tasks,"workouts":workouts,"today":today}
def request_user(uid):
    return db_exec("SELECT id,email,nick FROM users WHERE id=%s",(uid,),one=True) or {}
@app.before_request
def security():
    if request.path.startswith("/api/") and request.method in ("POST","PATCH","DELETE"):
        origin=request.headers.get("Origin")
        if origin:
            host=request.host_url.rstrip("/")
            if origin.rstrip("/") != host: return error("Недопустимый источник запроса.",403)
@app.get("/api/health")
def health():
    try: db_exec("SELECT 1"); return jsonify(ok=True,database=True)
    except Exception: return error("База данных недоступна.",503)
@app.post("/api/auth/register")
@limiter.limit("5 per hour")
def register():
    d=request.get_json(silent=True) or {}
    email=str(d.get("email","")).strip().lower(); nick=str(d.get("nick","")).strip()
    password=str(d.get("password",""))
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+",email): return error("Укажи корректный email.")
    if not 2<=len(nick)<=32: return error("Ник должен содержать от 2 до 32 символов.")
    if len(password)<8 or len(password)>128: return error("Пароль должен содержать от 8 до 128 символов.")
    hashed=bcrypt.hashpw(password.encode(),bcrypt.gensalt()).decode()
    try:
        with pool.connection() as c:
            with c.transaction():
                u=c.execute("INSERT INTO users(email,nick,password_hash) VALUES(%s,%s,%s) RETURNING id,email,nick",(email,nick,hashed)).fetchone()
                c.execute("INSERT INTO player_state(user_id) VALUES(%s)",(u["id"],))
        session.clear(); session["user_id"]=u["id"]
        return jsonify(user=u),201
    except Exception as e:
        if "unique" in str(e).lower(): return error("Такой email или ник уже используется.",409)
        app.logger.exception("register"); return error("Не удалось создать аккаунт.",500)
@app.post("/api/auth/login")
@limiter.limit("10 per hour")
def login():
    d=request.get_json(silent=True) or {}; email=str(d.get("email","")).strip().lower(); pw=str(d.get("password",""))
    u=db_exec("SELECT id,email,nick,password_hash FROM users WHERE lower(email)=lower(%s)",(email,),one=True)
    if not u or not bcrypt.checkpw(pw.encode(),u["password_hash"].encode()): return error("Неверный email или пароль.",401)
    session.clear(); session["user_id"]=u["id"]
    return jsonify(user={"id":u["id"],"email":u["email"],"nick":u["nick"]})
@app.post("/api/auth/logout")
def logout(): session.clear(); return jsonify(ok=True)
@app.get("/api/me")
@login_required
def me(): return jsonify(user=request.user)
@app.get("/api/state")
@login_required
def get_state():
    row=state(request.user["id"])
    return jsonify(row) if row else error("Профиль не найден.",404)
@app.get("/api/leaderboard")
def leaderboard():
    rows=db_exec("""SELECT u.nick,p.xp,p.coins,p.streak FROM player_state p JOIN users u ON u.id=p.user_id ORDER BY p.xp DESC,p.coins DESC LIMIT 10""",all=True)
    return jsonify(players=rows)
@app.patch("/api/profile")
@login_required
def profile():
    d=request.get_json(silent=True) or {}; uid=request.user["id"]
    allowed={"height","weight","activity","profileBio","profileGoal","reminderTime","dailyReminder","missedReminder","timezone"}
    old=db_exec("SELECT settings FROM player_state WHERE user_id=%s",(uid,),one=True)["settings"] or {}
    new={**old,**{k:v for k,v in d.items() if k in allowed}}
    if len(str(new.get("profileBio",""))) > 500: return error("Описание слишком длинное.")
    try: ZoneInfo(new.get("timezone","UTC"))
    except Exception: new["timezone"]="Asia/Tashkent"
    db_exec("UPDATE player_state SET settings=%s,updated_at=NOW() WHERE user_id=%s",(json.dumps(new),uid))
    return jsonify(settings=new)
@app.delete("/api/account")
@login_required
def delete_account():
    d=request.get_json(silent=True) or {}; pw=str(d.get("password",""))
    row=db_exec("SELECT password_hash FROM users WHERE id=%s",(request.user["id"],),one=True)
    if not row or not bcrypt.checkpw(pw.encode(),row["password_hash"].encode()): return error("Неверный пароль.",401)
    db_exec("DELETE FROM users WHERE id=%s",(request.user["id"],)); session.clear()
    return jsonify(ok=True)
@app.post("/api/shop/buy")
@login_required
def shop_buy():
    d=request.get_json(silent=True) or {}; item=d.get("itemId"); uid=request.user["id"]
    if item not in SHOP: return error("Такого товара нет.",404)
    price,kind=SHOP[item]
    with pool.connection() as c:
        with c.transaction():
            p=c.execute("SELECT coins,inventory FROM player_state WHERE user_id=%s FOR UPDATE",(uid,)).fetchone()
            if item in (p["inventory"] or []): return error("Предмет уже куплен.",409)
            if p["coins"]<price: return error("Недостаточно коенов.",400)
            c.execute("UPDATE player_state SET coins=coins-%s,inventory=array_append(inventory,%s),updated_at=NOW() WHERE user_id=%s",(price,item,uid))
            c.execute("INSERT INTO shop_purchases(user_id,item_id,price) VALUES(%s,%s,%s)",(uid,item,price))
    return jsonify(ok=True,itemId=item,price=price)
@app.post("/api/shop/equip")
@login_required
def shop_equip():
    d=request.get_json(silent=True) or {}; item=d.get("itemId"); uid=request.user["id"]
    if item not in SHOP: return error("Предмет не найден.",404)
    row=db_exec("SELECT inventory FROM player_state WHERE user_id=%s",(uid,),one=True)
    if item not in (row["inventory"] or []): return error("Сначала приобрети предмет.",403)
    kind=SHOP[item][1]; col={"theme":"equipped_theme","avatar":"equipped_avatar","voice":"equipped_voice"}.get(kind)
    if not col: return error("Этот предмет нельзя экипировать.")
    db_exec(f"UPDATE player_state SET {col}=%s,updated_at=NOW() WHERE user_id=%s",(item,uid))
    return jsonify(ok=True,itemId=item)
@app.post("/api/workouts")
@login_required
def workout():
    d=request.get_json(silent=True) or {}; uid=request.user["id"]
    try: mins=int(d.get("durationMinutes",d.get("duration_minutes",0)))
    except: mins=0
    if not 1<=mins<=180: return error("Продолжительность должна быть от 1 до 180 минут.")
    activity=str(d.get("activityType",d.get("activity_type","activity")))[:60]
    note=str(d.get("note",""))[:300]; tz=(db_exec("SELECT settings FROM player_state WHERE user_id=%s",(uid,),one=True)["settings"] or {}).get("timezone","UTC")
    day=local_day(tz); reqid=d.get("clientRequestId") or d.get("client_request_id")
    try: reqid=uuid.UUID(str(reqid)) if reqid else None
    except: return error("Некорректный идентификатор записи.")
    xp=min(100,mins); coins=min(50,mins//2)
    with pool.connection() as c:
        with c.transaction():
            if reqid:
                exists=c.execute("SELECT id FROM workout_logs WHERE user_id=%s AND client_request_id=%s",(uid,reqid)).fetchone()
                if exists: return jsonify(ok=True,duplicate=True)
            c.execute("INSERT INTO workout_logs(user_id,activity_type,duration_minutes,note,local_day,xp_awarded,coins_awarded,client_request_id) VALUES(%s,%s,%s,%s,%s,%s,%s,%s)",(uid,activity,mins,note,day,xp,coins,reqid))
            c.execute("UPDATE player_state SET xp=xp+%s,coins=coins+%s,total_tasks=total_tasks+1,updated_at=NOW() WHERE user_id=%s",(xp,coins,uid))
    return jsonify(ok=True,xpAwarded=xp,coinsAwarded=coins)
@app.get("/api/workouts")
@login_required
def workouts():
    rows=db_exec("SELECT id,activity_type,duration_minutes,note,local_day,xp_awarded,coins_awarded,logged_at FROM workout_logs WHERE user_id=%s ORDER BY logged_at DESC LIMIT 100",(request.user["id"],),all=True)
    return jsonify(workouts=rows)
@app.get("/api/programs")
@login_required
def programs():
    rows=db_exec("SELECT program_id,completed_days,started_at,last_completed_on FROM program_progress WHERE user_id=%s",(request.user["id"],),all=True)
    return jsonify(programs=[{"id":k,"title":v[0],"days":v[1],"itemId":v[2],"progress":next((r for r in rows if r["program_id"]==k),None)} for k,v in PROGRAMS.items()])
@app.post("/api/programs/<program_id>/start")
@login_required
def program_start(program_id):
    if program_id not in PROGRAMS: return error("Программа не найдена.",404)
    uid=request.user["id"]; item=PROGRAMS[program_id][2]
    if item:
        inv=db_exec("SELECT inventory FROM player_state WHERE user_id=%s",(uid,),one=True)["inventory"] or []
        if item not in inv: return error("Сначала приобрети курс.",403)
    db_exec("INSERT INTO program_progress(user_id,program_id) VALUES(%s,%s) ON CONFLICT DO NOTHING",(uid,program_id))
    return jsonify(ok=True)
@app.post("/api/programs/<program_id>/day")
@login_required
def program_day(program_id):
    d=request.get_json(silent=True) or {}
    try: day=int(d.get("day"))
    except: return error("Некорректный день.")
    if program_id not in PROGRAMS or not 1<=day<=PROGRAMS[program_id][1]: return error("Некорректный день.")
    uid=request.user["id"]
    with pool.connection() as c:
        with c.transaction():
            row=c.execute("SELECT completed_days FROM program_progress WHERE user_id=%s AND program_id=%s FOR UPDATE",(uid,program_id)).fetchone()
            if not row: return error("Сначала начни программу.",404)
            days=row["completed_days"] or []
            if day not in days:
                if day != len(days)+1: return error("Проходи дни последовательно.")
                days.append(day)
                c.execute("UPDATE program_progress SET completed_days=%s,last_completed_on=%s,updated_at=NOW() WHERE user_id=%s AND program_id=%s",(days,local_day("UTC"),uid,program_id))
    return jsonify(ok=True,completedDays=days)
@app.post("/api/gps/point")
@login_required
def gps_point():
    d=request.get_json(silent=True) or {}
    try:
        lat=float(d.get("latitude")); lon=float(d.get("longitude")); acc=float(d.get("accuracy",999)); ts=int(d.get("timestamp",0))
    except: return error("GPS-координаты некорректны.")
    if not (-90<=lat<=90 and -180<=lon<=180 and 0<=acc<=100 and ts>0): return error("Недостаточная точность GPS.")
    uid=request.user["id"]
    row=db_exec("SELECT * FROM player_state WHERE user_id=%s",(uid,),one=True)
    tz=(row["settings"] or {}).get("timezone","UTC"); today=local_day(tz)
    if row["geo_date"]!=today:
        db_exec("UPDATE player_state SET geo_date=%s,geo_meters=0,geo_farthest_meters=0,geo_start_lat=%s,geo_start_lon=%s,geo_last_lat=%s,geo_last_lon=%s,geo_last_timestamp=%s WHERE user_id=%s",(today,lat,lon,lat,lon,ts,uid))
        return jsonify(ok=True,meters=0)
    if row["geo_last_lat"] is None: return error("Начни GPS-прогулку заново.")
    dt=(ts-(row["geo_last_timestamp"] or ts))/1000
    if dt<=0 or dt>300: return error("Временная метка GPS недействительна.")
    r=6371000; p1=math.radians(row["geo_last_lat"]); p2=math.radians(lat)
    a=math.sin((p2-p1)/2)**2+math.cos(p1)*math.cos(p2)*math.sin(math.radians(lon-row["geo_last_lon"])/2)**2
    dist=2*r*math.asin(math.sqrt(a))
    if dist/dt>8: return error("Слишком высокая скорость перемещения.")
    meters=row["geo_meters"]+dist; far=max(row["geo_farthest_meters"],meters)
    db_exec("UPDATE player_state SET geo_meters=%s,geo_farthest_meters=%s,geo_last_lat=%s,geo_last_lon=%s,geo_last_timestamp=%s WHERE user_id=%s",(meters,far,lat,lon,ts,uid))
    return jsonify(ok=True,meters=round(meters),farthest=round(far))
@app.post("/api/gps/stop")
@login_required
def gps_stop():
    db_exec("UPDATE player_state SET geo_start_lat=NULL,geo_start_lon=NULL,geo_last_lat=NULL,geo_last_lon=NULL,geo_last_timestamp=NULL WHERE user_id=%s",(request.user["id"],))
    return jsonify(ok=True)
@app.get("/api/shop/content/<item_id>")
@login_required
def shop_content(item_id):
    uid=request.user["id"]; inv=db_exec("SELECT inventory FROM player_state WHERE user_id=%s",(uid,),one=True)["inventory"] or []
    if item_id not in inv: return error("Материал доступен после покупки.",403)
    return jsonify(itemId=item_id,details=[],note="Материал доступен в интерфейсе FitQuest.")
@app.route("/api/<path:path>",methods=["GET","POST","PATCH","DELETE"])
def api_not_found(path): return error("API-маршрут не найден.",404)
@app.get("/")
def index(): return send_from_directory("public","index.html")
@app.get("/<path:path>")
def static_files(path):
    full=os.path.join(BASE,"public",path)
    if os.path.isfile(full): return send_from_directory("public",path)
    return send_from_directory("public","index.html")
if __name__=="__main__":
    app.run(host="0.0.0.0",port=PORT,debug=(ENV!="production"))
