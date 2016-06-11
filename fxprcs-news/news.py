from flask import Flask
from flask_restful import Resource, Api
import requests
import json
import xmltodict

app = Flask(__name__)
api = Api(app)

class GetNews(Resource):
  def get(self):
    url = 'http://articlefeeds.nasdaq.com/nasdaq/categories?category=Forex%20and%20Currencies&format=xml';
    myResponse = requests.get(url)

    if(myResponse.ok):
      jsn = json.dumps(xmltodict.parse(myResponse.content))
      print (jsn)
      return {'news': jsn}
    else:
      myResponse.raise_for_status()

api.add_resource(GetNews, '/news')

if __name__ == '__main__':
    app.run(host='0.0.0.0')


