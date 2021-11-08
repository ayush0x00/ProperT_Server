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
    payload=[{}]

    def accumulateTweets(self,userId,platform="twitter"):
        exists=False
        for i in MyStreamListener.payload:
            if(i.userid):
                i.weight+=1
                exists=True
                break
        if not exists:
            data={"userId":userId,"weight":1,"platform":platform}
            MyStreamListener.payload.append(data)
        
        if(len(MyStreamListener.payload)==5):
            result=self.tokenizeAsset(MyStreamListener.payload)
            if result:
                MyStreamListener.payload=[{}]
    

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
        pass
    
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
    rule=["tokenTezos"]
    stream=Streamer()
    stream.streamTweets(rule)
    