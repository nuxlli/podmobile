# -*- coding: utf-8 -*-
#
# Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
#
# Dual licensed under the MIT (MIT-LICENSE.txt)
# and GPL (GPL-LICENSE.txt) licenses.
#
# http://code.google.com/p/podmobile

from PyQt4 import QtGui, QtCore
import sys, cjson, tempfile

from urlgrabber.grabber import URLGrabber, URLGrabError
from urlgrabber.progress import BaseMeter, TextMeter

#class StopDownload():
#  pass

class Progress(BaseMeter):
  def __init__(self, id, parent):
    BaseMeter.__init__(self)
    self.id = id
    self.parent = parent

  def _do_update(self, amount_read, now=None):
    self.parent.emit(QtCore.SIGNAL("update(int, int, QString)"),
                     self.id,
                     amount_read,
                     self.get_info())

  def _do_start(self, now=None):
    self.parent.emit(QtCore.SIGNAL("started(int, QString)"),
                     self.id,
                     self.get_info())

  def get_info(self):
    return cjson.encode({
      "filename"   : self.filename,
      "url"        : self.url,
      "basename"   : self.basename,
      "text"       : self.text,
      "size"       : self.size,
      "start_time" : self.start_time,
      "last_amount_read" : self.last_amount_read,
      "last_update_time" : self.last_update_time
    })

class downThread(QtCore.QThread):
  def __init__(self, parent, id, url, file):
    QtCore.QThread.__init__(self, parent)
    self.url    = url
    self.file   = file
    self.id     = id
    self.error  = None
    self.parent = parent
    self.progress = Progress(id, parent)
    self.connect(self, QtCore.SIGNAL('finished()'), self._finished)

  def run(self):
    g = URLGrabber(reget='simple')
    try:
      local_filename = g.urlgrab(self.url,
                                 self.file,
                                 progress_obj = self.progress)
    except URLGrabError, e:
      self.error = {
        'code'    :  e.errno,
        'message' :  e.strerror
      }
      self.parent.emit(QtCore.SIGNAL("error(int, QString, QString)"),
                       self.id,
                       cjson.encode(self.error), self.progress.get_info())

  def _finished(self):
    if (self.error == None):
      self.parent.emit(QtCore.SIGNAL("finished(int, QString)"),
                       self.id,
                       self.progress.get_info())

class Download(QtCore.QObject):
  downloads = []
  __pyqtSignals__ = (
    'error(int, QString, QString)',
    'finished(int, QString)',
    'update(int, int, QString)',
    'started(int, QString)'
  )

  def __init__(self, parent):
    QtCore.QObject.__init__(self, parent)

  @QtCore.pyqtSignature("QString", result = "int")
  def create(self, url):
    url = str(url.toUtf8())
    self.downloads.append(url)
    return len(self.downloads)-1

  @QtCore.pyqtSignature("int, QString")
  def start(self, id, file):
    file = file.toUtf8()
    if len(file) == 0:
      file = tempfile.mkstemp('podmobile')[1]
    down = self.downloads[id]
    if (isinstance(down, str)):
      down = self.downloads[id] = downThread(self, id, down, file)

    down.start()
