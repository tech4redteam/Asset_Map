import os
import flask
import dotenv
from pymongo import MongoClient
from bson.json_util import dumps as bson_dumps

dotenv.load_dotenv()

MONGO_URL = os.getenv('MONGO_URL')
MONGO_DATABASE = os.getenv('MONGO_DATABASE')
MONGO_USER = os.getenv('MONGO_USER')
MONGO_PASSWORD = os.getenv('MONGO_PASSWORD')

try:
  client = MongoClient(MONGO_URL, username=MONGO_USER, password=MONGO_PASSWORD, serverSelectionTimeoutMS=10000)
  db = client["secdb"]
except Exception as e:
  print("[ERROR] mongodb", e)

app = flask.Flask(__name__)


@app.route('/')
def index():
  unique_tids = db.scandata.distinct('tid')
  return flask.render_template('index.html', unique_tids=unique_tids)


@app.route('/asset-tree/<tid>')
def by_tid(tid):
  data = db.scandata.find({ 'tid': tid })
  if data is None:
    return "not found", 404
  data_str = bson_dumps(data)
  print(db.scandata.count_documents({ 'tid': tid }))
  return flask.render_template('tree.html', data=data_str)

if __name__ == '__main__':
  app.run(debug=True)
  app.config['TEMPLATES_AUTO_RELOAD'] = True