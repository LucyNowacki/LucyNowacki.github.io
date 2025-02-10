# -*- coding:utf-8 -*-
from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
STOP_RENDERING = runtime.STOP_RENDERING
__M_dict_builtin = dict
__M_locals_builtin = locals
_magic_number = 10
_modified_time = 1739188707.4511166
_enable_loop = True
_template_filename = '/home/lucy/anaconda3/envs/lucy/lib/python3.11/site-packages/nikola/data/themes/bootstrap4/templates/pagination_helper.tmpl'
_template_uri = 'pagination_helper.tmpl'
_source_encoding = 'utf-8'
_exports = ['page_navigation']


def render_body(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        __M_locals = __M_dict_builtin(pageargs=pageargs)
        __M_writer = context.writer()
        __M_writer('\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_page_navigation(context,current_page,page_links,prevlink,nextlink,prev_next_links_reversed,surrounding=5):
    __M_caller = context.caller_stack._push_frame()
    try:
        messages = context.get('messages', UNDEFINED)
        len = context.get('len', UNDEFINED)
        enumerate = context.get('enumerate', UNDEFINED)
        abs = context.get('abs', UNDEFINED)
        __M_writer = context.writer()
        __M_writer('\n<nav aria-label="Page navigation">\n  <ul class="pagination">\n')
        if prev_next_links_reversed:
            pass
            if nextlink:
                __M_writer('      <li class="page-item"><a href="')
                __M_writer(str(nextlink))
                __M_writer('" class="page-link" aria-label="')
                __M_writer(str(messages("Older posts")))
                __M_writer('"><span aria-hidden="true">&laquo;</span></a></li>\n')
            else:
                __M_writer('      <li class="page-item disabled"><a href="#" class="page-link" aria-label="')
                __M_writer(str(messages("Older posts")))
                __M_writer('"><span aria-hidden="true">&laquo;</span></a></li>\n')
        else:
            pass
            if prevlink:
                __M_writer('      <li class="page-item"><a href="')
                __M_writer(str(prevlink))
                __M_writer('" class="page-link" aria-label="')
                __M_writer(str(messages("Newer posts")))
                __M_writer('"><span aria-hidden="true">&laquo;</span></a></li>\n')
            else:
                __M_writer('      <li class="page-item disabled"><a href="#" class="page-link" aria-label="')
                __M_writer(str(messages("Newer posts")))
                __M_writer('"><span aria-hidden="true">&laquo;</span></a></li>\n')
        for i, link in enumerate(page_links):
            pass
            if abs(i - current_page) <= surrounding or i == 0 or i == len(page_links) - 1:
                __M_writer('      <li class="page-item ')
                __M_writer(str('active' if i == current_page else ''))
                __M_writer('"><a href="')
                __M_writer(str(link))
                __M_writer('" class="page-link">')
                __M_writer(str(i + 1))
                __M_writer(str(' <span class="sr-only">(current)</span>' if i == current_page else ''))
                __M_writer('</a></li>\n')
            elif i == current_page - surrounding - 1 or i == current_page + surrounding + 1:
                __M_writer('      <li class="page-item disabled"><a href="#" class="page-link" aria-label="…"><span aria-hidden="true">…</span></a></li>\n')
        if prev_next_links_reversed:
            pass
            if prevlink:
                __M_writer('      <li class="page-item"><a href="')
                __M_writer(str(prevlink))
                __M_writer('" class="page-link" aria-label="')
                __M_writer(str(messages("Newer posts")))
                __M_writer('"><span aria-hidden="true">&raquo;</span></a></li>\n')
            else:
                __M_writer('      <li class="page-item disabled"><a href="#" class="page-link" aria-label="')
                __M_writer(str(messages("Newer posts")))
                __M_writer('"><span aria-hidden="true">&raquo;</span></a></li>\n')
        else:
            pass
            if nextlink:
                __M_writer('      <li class="page-item"><a href="')
                __M_writer(str(nextlink))
                __M_writer('" class="page-link" aria-label="')
                __M_writer(str(messages("Older posts")))
                __M_writer('"><span aria-hidden="true">&raquo;</span></a></li>\n')
            else:
                __M_writer('      <li class="page-item disabled"><a href="#" class="page-link" aria-label="')
                __M_writer(str(messages("Older posts")))
                __M_writer('"><span aria-hidden="true">&raquo;</span></a></li>\n')
        __M_writer('  </ul>\n</nav>\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


"""
__M_BEGIN_METADATA
{"filename": "/home/lucy/anaconda3/envs/lucy/lib/python3.11/site-packages/nikola/data/themes/bootstrap4/templates/pagination_helper.tmpl", "uri": "pagination_helper.tmpl", "source_encoding": "utf-8", "line_map": {"16": 0, "21": 40, "27": 2, "35": 2, "36": 5, "38": 6, "39": 7, "40": 7, "41": 7, "42": 7, "43": 7, "44": 8, "45": 9, "46": 9, "47": 9, "48": 11, "50": 12, "51": 13, "52": 13, "53": 13, "54": 13, "55": 13, "56": 14, "57": 15, "58": 15, "59": 15, "60": 18, "62": 19, "63": 20, "64": 20, "65": 20, "66": 20, "67": 20, "68": 20, "69": 20, "70": 20, "71": 21, "72": 22, "73": 25, "75": 26, "76": 27, "77": 27, "78": 27, "79": 27, "80": 27, "81": 28, "82": 29, "83": 29, "84": 29, "85": 31, "87": 32, "88": 33, "89": 33, "90": 33, "91": 33, "92": 33, "93": 34, "94": 35, "95": 35, "96": 35, "97": 38, "103": 97}}
__M_END_METADATA
"""
