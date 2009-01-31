# -*- coding: utf-8 -*-
#
# Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
#
# Dual licensed under the MIT (MIT-LICENSE.txt)
# and GPL (GPL-LICENSE.txt) licenses.
#
# http://code.google.com/p/podmobile

from PyQt4 import QtCore
import sqlite3
import cjson

def d(msg):
  print "Database: " + msg

def dict_factory(cursor, row):
  d = {}
  for idx, col in enumerate(cursor.description):
    d[col[0]] = row[idx]
  return d

class Database(QtCore.QObject):
  datas = []
  rows  = []

  def __init__(self, bases_dir):
    QtCore.QObject.__init__(self)
    self.setObjectName("database")
    self.bases_dir = bases_dir

  @QtCore.pyqtSignature("QString, QString", result = "QString")
  def open(self, name, version):
    conn = sqlite3.connect(self.bases_dir + '/' + str(name))
    conn.row_factory = dict_factory
    self.datas.append(conn)
    self.rows.append([])
    return str(len(self.datas)-1)

  @QtCore.pyqtSignature("int, QString", result = "QString")
  def query(self, dbid, query):
    query = query.toUtf8()
    try:
      conn   = self.datas[dbid]
      cursor = conn.cursor()
      cursor.execute(str(query))

      self.rows[dbid] = cursor.fetchall()

      result = {
        'insertId': cursor.lastrowid,
        'rowsAffected': cursor.rowcount,
        'length': len(self.rows[dbid])
      }

    except sqlite3.Error, e:
      result = {
        'message': e.args
      }

    #d(cjson.encode(result))
    return cjson.encode(result)

  @QtCore.pyqtSignature("int, int", result = "QString")
  def item(self, dbid, row):
    #d(cjson.encode(self.rows[dbid][row]))
    return cjson.encode(self.rows[dbid][row])

  @QtCore.pyqtSignature("int")
  def commit(self, dbid):
    #d("Commit");
    self.datas[dbid].commit()

  # TODO: Arrumar uma forma de fechar os bancos de dados abertos
  def close(self):
    for data in self.datas:
      data.close()
