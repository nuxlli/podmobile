#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging, cjson

BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE = range(8)

#The background is set with 40 plus the number of the color, and the foreground with 30

#These are the sequences need to get colored ouput
RESET_SEQ = "\x1b\x5b0m"
COLOR_SEQ = "\x1b\x5b1;%d;1m"
BOLD_SEQ  = "\x1b\x5b1m"
ALT_SEQ   = ["", BOLD_SEQ]

COLORS = {
    'WARNING': YELLOW,
    'INFO': WHITE,
    'DEBUG': BLUE,
    'CRITICAL': YELLOW,
    'ERROR': RED
}

class ColoredFormatter(logging.Formatter):
    alt = 1

    def format(self, record):
        self.alt = (self.alt == 0) and 1 or 0

        # Level
        levelname = record.levelname
        if levelname in COLORS:
            record.levelname = (COLOR_SEQ % (30 + COLORS[levelname]) + levelname + RESET_SEQ)

        # message
        record.msg = (ALT_SEQ[self.alt] + record.msg + RESET_SEQ)

        return logging.Formatter.format(self, record)