# -*- coding: utf-8 -*-
#
# Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
#
# Dual licensed under the MIT (MIT-LICENSE.txt)
# and GPL (GPL-LICENSE.txt) licenses.
#
# http://code.google.com/p/eibox

import gst, time, logging, cjson
from PyQt4 import QtCore, QtGui

#import gobject
#gobject.threads_init()

def _gst_state__str__(self):
    return '%s' % self.value_name

gst.State.__str__ = _gst_state__str__
gst.StateChange.__str__ = _gst_state__str__
gst.StateChangeReturn.__str__ = _gst_state__str__

class Player(QtCore.QThread):
    pipeline  = None;
    playbin   = gst.element_factory_make('playbin')

    _state    = None;
    _mutex    = QtCore.QMutex()
    _duration = None;
    
    __pyqtSignals__ = (
        'stateChanged(QString, QString)',
        'valueChanged(int)',
        'totalTimeChanged(int)',
        'tick(int, int)',
        'finished()',
        'error(int, QString)'
    )

    def __init__(self, parent):
        QtCore.QThread.__init__(self, parent)
        self.pipeline = gst.Pipeline('podmobile')
        self.pipeline.add(self.playbin)
        self._state = self.pipeline.get_state()[1]

        self.start()

    def lock(self):
        self._mutex.lock();

    def unlock(self):
        self._mutex.unlock();
        
    def run(self):
        thread_id = self.currentThread
        while thread_id == self.currentThread:
            if self._mutex.tryLock():
                self.process_changes()
                self.unlock();
            time.sleep(1)
    
    @QtCore.pyqtSignature("")
    def play(self):
        self.lock()
        self.pipeline.set_state(gst.STATE_PLAYING)
        self.process_changes()
        self.unlock();

    @QtCore.pyqtSignature("")
    def pause(self):
        self.lock()
        self.pipeline.set_state(gst.STATE_PAUSED)
        self.process_changes()
        self.unlock();

    @QtCore.pyqtSignature("")
    def stop(self):
        self.lock()
        self.pipeline.set_state(gst.STATE_NULL)
        self.process_changes()
        self.unlock();

    @QtCore.pyqtSignature("QString")
    def setCurrentSource(self, uri):
        self.lock()
        uri = 'file://' + str(uri)
        self.pipeline.set_state(gst.STATE_NULL)
        self.playbin.set_property('uri', uri)
        self.pipeline.set_state(gst.STATE_PLAYING)
        self.pipeline.set_state(gst.STATE_PAUSED)
        #else:
        #    self.emit(QtCore.SIGNAL('error(int, QString)'), 100, 'Dont load file');
        #    result = False;
        self.process_changes()
        self.unlock();
    
    @QtCore.pyqtSignature("", result = "QString")
    def state(self):
        return str(self.pipeline.get_state()[1])
    
    @QtCore.pyqtSignature("int")
    def seek(self, time):
        self.lock()
        self.pipeline.seek_simple(gst.FORMAT_TIME, gst.SEEK_FLAG_FLUSH, time * gst.MSECOND)
        self.unlock()
    
    _interval = 1;
    _lasttime = time.time();

    @QtCore.pyqtSignature("", result = "int")
    def getDuration(self):
        return self.pipeline.query_duration(gst.FORMAT_TIME)[0]/gst.MSECOND

    @QtCore.pyqtSignature("", result = "int")
    def getPosition(self):
        return self.pipeline.query_position(gst.FORMAT_TIME)[0]/gst.MSECOND
    
    duration = QtCore.pyqtProperty("int", getDuration)
    position = QtCore.pyqtProperty("int", getPosition)

    def process_changes(self):
        # State
        states = self.pipeline.get_state()
        if states[0] == gst.STATE_CHANGE_SUCCESS:
            state = states[1]
            if state != self._state:
                self.emit(QtCore.SIGNAL('stateChanged(QString, QString)'), str(state), str(self._state))
                self._state = state

            if state != gst.STATE_NULL:
                # Duration
                duration = self.getDuration();
                if (self._duration != duration):
                    self._duration = duration
                    self.emit(QtCore.SIGNAL('totalTimeChanged(int)'), duration)
                
                # Position
                if state == gst.STATE_PLAYING:
                    position = self.getPosition();
                    if ((duration - position) < 100):
                        self.emit(QtCore.SIGNAL('finished()'))
                    elif (time.time() - self._lasttime > self._interval):
                        self.emit(QtCore.SIGNAL('tick(int, int)'), position, self._duration)
