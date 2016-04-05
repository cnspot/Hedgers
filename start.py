import sys
import os
import time
while True :
	localtime = time.asctime(time.localtime(time.time()))
	print "Beijing's time :", localtime
	os.system('node BTCC2OK.js')
	print 'start node 3s later'
	time.sleep(3)
