# -*- coding:utf-8 -*-
from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
STOP_RENDERING = runtime.STOP_RENDERING
__M_dict_builtin = dict
__M_locals_builtin = locals
_magic_number = 10
_modified_time = 1544320938.432697
_enable_loop = True
_template_filename = '/home/lucy/anaconda3/envs/techblog/lib/python3.6/site-packages/nikola/data/themes/base/templates/comments_helper_commento.tmpl'
_template_uri = 'comments_helper_commento.tmpl'
_source_encoding = 'utf-8'
_exports = ['comment_form', 'comment_link', 'comment_link_script']


def render_body(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        __M_locals = __M_dict_builtin(pageargs=pageargs)
        __M_writer = context.writer()
        __M_writer('\n\n')
        __M_writer('\n\n\n')
        __M_writer('\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_comment_form(context,url,title,identifier):
    __M_caller = context.caller_stack._push_frame()
    try:
        __M_writer = context.writer()
        __M_writer('\n    <div id="commento"></div>\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_comment_link(context,link,identifier):
    __M_caller = context.caller_stack._push_frame()
    try:
        __M_writer = context.writer()
        __M_writer('\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_comment_link_script(context):
    __M_caller = context.caller_stack._push_frame()
    try:
        comment_system_id = context.get('comment_system_id', UNDEFINED)
        __M_writer = context.writer()
        __M_writer('\n<script src="')
        __M_writer(str(comment_system_id))
        __M_writer('/assets/js/commento.min.js"></script>\n<script>\nwindow.onload = function() {\n    Commento.init({\n        serverUrl: "')
        __M_writer(str(comment_system_id))
        __M_writer('",\n    });\n}\n</script>\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


"""
__M_BEGIN_METADATA
{"filename": "/home/lucy/anaconda3/envs/techblog/lib/python3.6/site-packages/nikola/data/themes/base/templates/comments_helper_commento.tmpl", "uri": "comments_helper_commento.tmpl", "source_encoding": "utf-8", "line_map": {"16": 0, "21": 4, "22": 7, "23": 19, "29": 2, "33": 2, "39": 6, "43": 6, "49": 10, "54": 10, "55": 11, "56": 11, "57": 15, "58": 15, "64": 58}}
__M_END_METADATA
"""
