import os

import redis
from rq import Worker, Queue, Connection

#documentation links
#https://devcenter.heroku.com/articles/python-rq
#https://bigishdata.com/2016/12/15/running-python-background-jobs-with-heroku/

#worker file

listen = ['high', 'default', 'low']

redis_url = os.getenv('REDISTOGO_URL', 'redis://localhost:6379')

conn = redis.from_url(redis_url)

#main
#run this in terminal before running this program: redis-server
if __name__ == '__main__':
    with Connection(conn):
        worker = Worker(map(Queue, listen))
        worker.work()