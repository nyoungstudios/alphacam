import GPUtil
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import storage
import threading
import random

darknetPath = "/homes/ma438/scratch/darknet/"
rootDataPath = "/homes/ma438/scratch/darknet/labs/"
outputPath = "/homes/ma438/scratch/darknet/labsOut/"
outputImgPath = "/homes/ma438/scratch/darknet/labsImg/"
auth = "alphacam-94bcc-firebase-adminsdk-4i1bs-0ac44401da.json"


class FB:
    def __init__(self):
        cred = credentials.Certificate(auth)
        self.default_app = firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://alphacam-94bcc.firebaseio.com',
            'storageBucket': "alphacam-94bcc.appspot.com"
        })
        self.root = db.reference()
        self.labs = db.reference("labs")
        self.storage = storage.bucket(app=self.default_app)

    def getAllLabImage(self):
        dict = self.labs.get()
        keys = dict.keys()
        os.system("rm -rf %s" % rootDataPath)
        os.system("mkdir %s" % rootDataPath)
        for k in keys:
            img = dict[k]['img']
            if dict[k]['isLab'] == True:
                wgetCmd = "wget -P %s %s" % (rootDataPath, img)
                os.system(wgetCmd)

    def analyseResult(self):
        dict = self.labs.get()
        keys = dict.keys()
        for k in keys:
            cnt = peopleCount(dict[k])
            if cnt != -1:
                dict[k]['people'] = peopleCount(dict[k])  
        # update
        self.labs.update(dict)
    def analyisSingle(self, lab):
        lab = os.path.basename(os.path.normpath(lab['img']))

def bestGPU():
    try:
        return GPUtil.getFirstAvailable()
    except RuntimeError:
        return [random.randint(0, 7)]


def predict(gpu, lab, fb):
    darknetCmd = "darknet -i %d detect cfg/yolov3.cfg yolov3.weights %s -out %s > %s" % (
        gpu,
        rootDataPath + lab,
        outputImgPath + lab,
        outputPath + lab + ".log")
    mvCmd = "cp predictions.png %s%s" % (outputImgPath, lab)
    print darknetCmd
    os.system(darknetCmd)
    # Check if error
    try:
        f = open(outputPath + lab + ".log")
        if "CUDA Error" in f:
            print "Failed return"
            return
    except IOError:
        return

    # os.system(mvCmd)
    blob = fb.storage.blob(lab)
    blob.upload_from_filename(outputImgPath + lab +".png")
    fb.analyseResult()
    


def clean():
    os.chdir(darknetPath)
    os.system("rm -rf %s" % outputPath)
    os.system("mkdir %s" % outputPath)
    os.system("rm -rf %s" % outputImgPath)
    os.system("mkdir %s" % outputImgPath)


def predictAll(fb):
    labs = os.listdir(rootDataPath)
    # TODO fix bug
    threads = []
    for l in labs:
        t = threading.Thread(target=predict, args=(bestGPU()[0], l, fb,))
        threads.append(t)
        t.start()
        # predict(bestGPU()[0], l, fb)
        # block until all the threads finish (i.e. until all function_a functions finish)
    for t in threads:
        t.join()

def peopleCount(lab):
    lab = os.path.basename(os.path.normpath(lab['img']))
    file = open(outputPath + lab + ".log", 'r').read()
    if "CUDA Error" in file:
        return -1
    count = file.count("person")

    return count
