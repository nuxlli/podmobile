# http://www.silassewell.com/blog/2008/05/05/universal-feed-parser-json/

def json_make_normal(obj):
    if type(obj) in [str, unicode, int, float, bool, dict, set, list, tuple]:
        return obj
    try: return dict(obj)
    except: pass
    try: return list(obj)
    except: pass
    return None

def json_handle(obj):
    obj = json_make_normal(obj)
    if type(obj) in [str, unicode]:
        obj = obj.replace('\\', '\\\\')
        obj = obj.replace('"', '\\"')
        obj = obj.replace('\b', '\\\b')
        obj = obj.replace('\f', '\\\f')
        obj = obj.replace('\n', '\\\n')
        obj = obj.replace('\r', '\\\r')
        obj = obj.replace('\t', '\\\t')
        return '"%s"' % obj
    elif type(obj) in [int, float]:
        return obj
    elif type(obj) is bool:
        if obj: return 'true'
        else: return 'false'
    elif type(obj) is type(None):
        return 'null'
    elif type(obj) is dict:
        temp = ''
        for key in obj.keys():
            temp += '%s:%s, ' % (json_handle(key), json_handle(obj[key]))
        return '{%s}' % temp[:-2]
    elif type(obj) in [set, list, tuple]:
        temp = ''
        for value in obj:
            temp += '%s, ' % json_handle(value)
        return '[%s]' % temp[:-2]
    return 'null'
