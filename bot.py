from dotenv import load_dotenv
import os
import tweepy
import json
import requests

class AuthHandler:
    def authenticate_twitter_app(self):
        auth=tweepy.OAuthHandler(os.environ.get('api_key'),os.environ.get('api_key_secret'))
        auth.set_access_token(os.environ.get('access_token'),os.environ.get('access_token_secret'))
        api=tweepy.API(auth)
        return api

class MyStreamListener(tweepy.StreamListener,AuthHandler):
    payload=[{"userId":"-1","weight":-1,"platform":"twitter"}]

    def accumulateTweets(self,userId,platform="twitter"):
        print(userId)
        try:
            for i in MyStreamListener.payload:
                i[userId]
                print("Existing user...")
                i.weight+=1
        except KeyError:
            print("New user...")
            data={"userId":userId,"weight":1,"platform":"twitter"}
            MyStreamListener.payload.append(data)
        
        if(len(MyStreamListener.payload)==5):
            result= self.tokenizeAsset(MyStreamListener.payload)
            if result:
                MyStreamListener.payload=[{"userId":"-1","weight":-1,"platform":"twitter"}]
    

    def tokenizeAsset(self, payload):
        print("Tokenizing tweet")
        #payload={userId:userId,weight:weight,platform:platform}
        headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r=requests.post("http://localhost:80/twitter",data=json.dumps(payload),headers=headers)
        response=r.json()
        if(response["success"]):
            print("Successfully tokenized with transaction hash ",response["message"])
            return True
        else:
            print("Error while tokenizing")
            print(response["message"])
            return False

    def on_status(self, status):
        #print(status)
        self.accumulateTweets(status.user.id_str)
    
    def on_error(self, status_code):
        print(status_code)
    

class Streamer:
    def __init__(self):
        self.authenticate=AuthHandler()

    def streamTweets(self,rule):
        listener=MyStreamListener()
        api=self.authenticate.authenticate_twitter_app()
        myStream = tweepy.Stream(auth = api.auth, listener=listener)
        myStream.filter(track=rule,is_async=True)


if __name__== "__main__":
    load_dotenv()
    rule=["@ayush_0x00","@Twitter"]
    stream=Streamer()
    stream.streamTweets(rule)
    