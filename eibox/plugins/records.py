#!/usr/bin/python

import gst, sys
from PyQt4 import QtCore, QtGui 

# gst-launch-0.10 alsasrc ! audioconvert ! vorbisenc ! oggmux ! filesink location=teste.ogg

class Records(QtCore.QThread):
    pipe   = None
    _state = 'NULL'

    __pyqtSignals__ = (
            'finished(int, int, QString, bool)',
    )

    def __init__(self, parent = None):
        QtCore.QThread.__init__(self, parent)
        self.start()

    #def run(self):
    #    thread_id = self.currentThread
    #    while thread_id == self.currentThread:
    #        if self._mutex.tryLock():
    #            self.process_changes()
    #            self.unlock();
    #        time.sleep(1)

    @QtCore.pyqtSignature("QString, int, bool")
    def record(self, file, position, cont):
        self.file = str(file)
        self.position = position
        self.cont = cont
        self.pipe = gst.parse_launch("alsasrc ! audioconvert ! vorbisenc ! oggmux ! filesink location=%s" % self.file)
        self._state = 'RECORD'
        self.pipe.set_state(gst.STATE_PLAYING)

    @QtCore.pyqtSignature("")
    def pause(self):
        self.pipe.set_state(gst.STATE_PAUSED)

    @QtCore.pyqtSignature("")
    def stop(self):
        self.pipe.set_state(gst.STATE_NULL)
        self._state = 'NULL'
        duration = self.pipe.query_position(gst.FORMAT_TIME)[0]/gst.MSECOND
        print duration
        self.emit(QtCore.SIGNAL('finished(int, int, QString, bool)'), duration, self.position, QtCore.QString(self.file), self.cont)
        del(self.pipe)
        self.pipe = None
    
    @QtCore.pyqtSignature("", result = "QString")
    def getState(self):
        return self._state
    
    state = QtCore.pyqtProperty("QString", getState)
