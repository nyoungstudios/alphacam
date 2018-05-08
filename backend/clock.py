from apscheduler.schedulers.blocking import BlockingScheduler
from rq import Queue
from worker import conn
from run import run_scanFirebase, getLabs, getPhoneNumbers

#creates scheduler object
sched = BlockingScheduler()

#creates connection
q = Queue(connection=conn)

#function that enqueues run function
def scanFirebase():
    q.enqueue(run_scanFirebase)

#adds jobs to queue
sched.add_job(scanFirebase)
sched.add_job(scanFirebase, 'interval', minutes=15)
sched.start()