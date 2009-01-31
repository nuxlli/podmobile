# -*- coding: utf-8 -*-
#
# Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
#
# Dual licensed under the MIT (MIT-LICENSE.txt)
# and GPL (GPL-LICENSE.txt) licenses.
#
# http://code.google.com/p/podmobile


from PyQt4 import QtCore
from PyQt4.phonon import Phonon

class Player(Phonon.MediaObject):

  __pyqtSignals__ = ('openFile(QString)','stateChanged(int, int)')

  def __init__(self, parent):
    Phonon.MediaObject.__init__(self, parent)
    self.setTickInterval(200);
    Phonon.createPath(self, Phonon.AudioOutput(Phonon.MusicCategory, parent));
    self.connect(self, QtCore.SIGNAL("stateChanged(Phonon::State, Phonon::State)"), self.__stateChanged)

  @QtCore.pyqtSignature("QString")
  def setCurrentSource(self, uri):
    Phonon.MediaObject.setCurrentSource(self, Phonon.MediaSource(uri))

  @QtCore.pyqtSignature("", result = "int")
  def state(self):
    return Phonon.MediaObject.state(self)

  def __stateChanged(self, newstate, oldstate):
    self.emit(QtCore.SIGNAL('stateChanged(int, int)'), int(newstate), int(oldstate))
