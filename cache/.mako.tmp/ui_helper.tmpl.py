# -*- coding:utf-8 -*-
from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
STOP_RENDERING = runtime.STOP_RENDERING
__M_dict_builtin = dict
__M_locals_builtin = locals
_magic_number = 10
_modified_time = 1739188707.2523892
_enable_loop = True
_template_filename = '/home/lucy/anaconda3/envs/lucy/lib/python3.11/site-packages/nikola/data/themes/bootstrap4/templates/ui_helper.tmpl'
_template_uri = 'ui_helper.tmpl'
_source_encoding = 'utf-8'
_exports = ['breadcrumbs', 'show_sourcelink']


def render_body(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        __M_locals = __M_dict_builtin(pageargs=pageargs)
        __M_writer = context.writer()
        __M_writer('\n\n')
        __M_writer('\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_breadcrumbs(context,crumbs):
    __M_caller = context.caller_stack._push_frame()
    try:
        index_file = context.get('index_file', UNDEFINED)
        __M_writer = context.writer()
        __M_writer('\n')
        if crumbs:
            __M_writer('<nav class="breadcrumbs">\n<ul class="breadcrumb">\n')
            for link, text in crumbs:
                pass
                if text != index_file:
                    pass
                    if link == '#':
                        __M_writer('                <li class="breadcrumb-item active">')
                        __M_writer(str(text.rsplit('.html', 1)[0]))
                        __M_writer('</li>\n')
                    else:
                        __M_writer('                <li class="breadcrumb-item"><a href="')
                        __M_writer(str(link))
                        __M_writer('">')
                        __M_writer(str(text))
                        __M_writer('</a></li>\n')
            __M_writer('</ul>\n</nav>\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_show_sourcelink(context,sourcelink_href):
    __M_caller = context.caller_stack._push_frame()
    try:
        messages = context.get('messages', UNDEFINED)
        __M_writer = context.writer()
        __M_writer('\n    <li class="nav-item">\n    <a href="')
        __M_writer(str(sourcelink_href))
        __M_writer('" id="sourcelink" class="nav-link">')
        __M_writer(str(messages("Source")))
        __M_writer('</a>\n    </li>\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


"""
__M_BEGIN_METADATA
{"filename": "/home/lucy/anaconda3/envs/lucy/lib/python3.11/site-packages/nikola/data/themes/bootstrap4/templates/ui_helper.tmpl", "uri": "ui_helper.tmpl", "source_encoding": "utf-8", "line_map": {"16": 0, "21": 18, "22": 24, "28": 2, "33": 2, "34": 3, "35": 4, "36": 6, "38": 7, "40": 8, "41": 9, "42": 9, "43": 9, "44": 10, "45": 11, "46": 11, "47": 11, "48": 11, "49": 11, "50": 15, "56": 20, "61": 20, "62": 22, "63": 22, "64": 22, "65": 22, "71": 65}}
__M_END_METADATA
"""
