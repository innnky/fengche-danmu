from flask import Flask, redirect, url_for, request
from flask_cors import CORS,cross_origin
import sqlite3
app = Flask(__name__)


def ins(time, content, ep, aid, source):
    conn = sqlite3.connect('danmu.db')
    c = conn.cursor()
    c.execute("INSERT INTO danmu (TIME,CONTENT,EP,SOURCE,AID) \
      VALUES ({},'{}',{},{},{})".format(time, content, ep, source, aid))
    conn.commit()
    c.close()

def get(ep,aid,source):
    conn = sqlite3.connect('danmu.db')
    c = conn.cursor()
    cursor = c.execute("SELECT time, content, SOURCE from danmu where aid={} and ep={} and source={}".format(aid,ep,source))
    result = [{'time':i[0], 'content':i[1]} for i in cursor]
    cursor = c.execute("select source, count(*) from danmu where aid={} and ep={} group by source".format(aid,ep))
    r2 = [{'source':i[0], 'counts':i[1]} for i in cursor]
    c.close()
    return result,r2


@app.route('/')
@cross_origin()
def hello():
    return 'Welcome to My Watchlist!'


@app.route("/getdanmu")
@cross_origin()
def getdanmu():
    aid = request.args.get('aid')
    ep = request.args.get('ep')
    source = request.args.get("source")
    data,meta = get(ep,aid,source)
    return {"status":0, "data": data, "meta_info":meta}

@app.route("/senddanmu", methods=['GET','POST'])
@cross_origin()
def senddanmu():
    time = request.args.get('time')
    content = request.args.get('content')
    ep = request.args.get('ep')
    aid = request.args.get('aid')
    source = request.args.get('source')
    # print(time,content)
    # time = request.args.get("time")
    # content = request.args.get("content")
    ins(time,content,ep,aid,source)
    return {"status":0}


app.run(host='0.0.0.0',port=5000, debug=True)
