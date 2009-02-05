#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright (C) 2008 Éverton Ribeiro nuxlli@gmail.com
#
# Dual licensed under the MIT (MIT-LICENSE.txt)
# and GPL (GPL-LICENSE.txt) licenses.
#
# http://code.google.com/p/podmobile

import os
from eibox import *

try:
    import settings # Assumed to be in the same directory.
except ImportError:
    import sys
    sys.stderr.write("Error: Can't find the file 'settings.py' in the directory containing %r. It appears you've customized things.\n(If the file settings.py does indeed exist, it's causing an ImportError somehow.)\n" % __file__)
    sys.exit(1)

class PodmobileWindow(EiboxWindow):
    def __init__(self, settings):
      EiboxWindow.__init__(self, settings)

      # Set defaults dirs
      self.home_dir = os.path.abspath(os.path.expanduser('~/.podmobile'))
      if not os.path.exists(self.home_dir):
        os.makedirs(self.home_dir)

eibox_main(PodmobileWindow, settings)