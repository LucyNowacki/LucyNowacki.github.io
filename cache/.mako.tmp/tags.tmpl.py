# -*- coding:utf-8 -*-
from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
STOP_RENDERING = runtime.STOP_RENDERING
__M_dict_builtin = dict
__M_locals_builtin = locals
_magic_number = 10
_modified_time = 1739188707.4621215
_enable_loop = True
_template_filename = '/home/lucy/anaconda3/envs/lucy/lib/python3.11/site-packages/nikola/data/themes/bootstrap4/templates/tags.tmpl'
_template_uri = 'tags.tmpl'
_source_encoding = 'utf-8'
_exports = ['content']


def _mako_get_namespace(context, name):
    try:
        return context.namespaces[(__name__, name)]
    except KeyError:
        _mako_generate_namespaces(context)
        return context.namespaces[(__name__, name)]
def _mako_generate_namespaces(context):
    pass
def _mako_inherit(template, context):
    _mako_generate_namespaces(context)
    return runtime._inherit_from(context, 'base.tmpl', _template_uri)
def render_body(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        __M_locals = __M_dict_builtin(pageargs=pageargs)
        title = context.get('title', UNDEFINED)
        hidden_tags = context.get('hidden_tags', UNDEFINED)
        cat_items = context.get('cat_items', UNDEFINED)
        cat_hierarchy = context.get('cat_hierarchy', UNDEFINED)
        items = context.get('items', UNDEFINED)
        def content():
            return render_content(context._locals(__M_locals))
        range = context.get('range', UNDEFINED)
        len = context.get('len', UNDEFINED)
        messages = context.get('messages', UNDEFINED)
        __M_writer = context.writer()
        __M_writer('\n\n')
        if 'parent' not in context._data or not hasattr(context._data['parent'], 'content'):
            context['self'].content(**pageargs)
        

        __M_writer('\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_content(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        title = context.get('title', UNDEFINED)
        hidden_tags = context.get('hidden_tags', UNDEFINED)
        cat_items = context.get('cat_items', UNDEFINED)
        cat_hierarchy = context.get('cat_hierarchy', UNDEFINED)
        items = context.get('items', UNDEFINED)
        def content():
            return render_content(context)
        range = context.get('range', UNDEFINED)
        len = context.get('len', UNDEFINED)
        messages = context.get('messages', UNDEFINED)
        __M_writer = context.writer()
        __M_writer('\n<h1>')
        __M_writer(filters.html_escape(str(title)))
        __M_writer('</h1>\n')
        if cat_items:
            pass
            if items:
                __M_writer('        <h2>')
                __M_writer(str(messages("Categories")))
                __M_writer('</h2>\n')
            for text, full_name, path, link, indent_levels, indent_change_before, indent_change_after in cat_hierarchy:
                pass
                for i in range(indent_change_before):
                    __M_writer('            <ul class="list-inline">\n')
                __M_writer('        <li class="list-inline-item"><a class="reference badge badge-secondary" href="')
                __M_writer(str(link))
                __M_writer('">')
                __M_writer(filters.html_escape(str(text)))
                __M_writer('</a>\n')
                if indent_change_after <= 0:
                    __M_writer('            </li>\n')
                for i in range(-indent_change_after):
                    __M_writer('            </ul>\n')
                    if i + 1 < len(indent_levels):
                        __M_writer('                </li>\n')
            if items:
                __M_writer('        <h2>')
                __M_writer(str(messages("Tags")))
                __M_writer('</h2>\n')
        if items:
            __M_writer('    <ul class="list-inline">\n')
            for text, link in items:
                pass
                if text not in hidden_tags:
                    __M_writer('            <li class="list-inline-item"><a class="reference badge badge-secondary" href="')
                    __M_writer(str(link))
                    __M_writer('">')
                    __M_writer(filters.html_escape(str(text)))
                    __M_writer('</a></li>\n')
            __M_writer('    </ul>\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


"""
__M_BEGIN_METADATA
{"filename": "/home/lucy/anaconda3/envs/lucy/lib/python3.11/site-packages/nikola/data/themes/bootstrap4/templates/tags.tmpl", "uri": "tags.tmpl", "source_encoding": "utf-8", "line_map": {"27": 0, "42": 2, "47": 38, "53": 4, "67": 4, "68": 5, "69": 5, "70": 6, "72": 7, "73": 8, "74": 8, "75": 8, "76": 10, "78": 11, "79": 12, "80": 14, "81": 14, "82": 14, "83": 14, "84": 14, "85": 15, "86": 16, "87": 18, "88": 19, "89": 20, "90": 21, "91": 25, "92": 26, "93": 26, "94": 26, "95": 29, "96": 30, "97": 31, "99": 32, "100": 33, "101": 33, "102": 33, "103": 33, "104": 33, "105": 36, "111": 105}}
__M_END_METADATA
"""
