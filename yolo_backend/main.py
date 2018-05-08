from util import *
import os
def main():
    fb = FB()
    while True:
        clean()
        fb.getAllLabImage()
        predictAll(fb)
        # fb.analyseResult()





if __name__ == "__main__":
    main()
