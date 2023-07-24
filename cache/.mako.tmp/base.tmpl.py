# -*- coding:utf-8 -*-
from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
STOP_RENDERING = runtime.STOP_RENDERING
__M_dict_builtin = dict
__M_locals_builtin = locals
_magic_number = 10
_modified_time = 1690201124.5042253
_enable_loop = True
_template_filename = '/home/lucy/anaconda3/envs/lucy/lib/python3.10/site-packages/nikola/data/themes/bootstrap4/templates/base.tmpl'
_template_uri = 'base.tmpl'
_source_encoding = 'utf-8'
_exports = ['extra_head', 'belowtitle', 'sourcelink', 'extra_header', 'content', 'extra_footer', 'extra_js']


def _mako_get_namespace(context, name):
    try:
        return context.namespaces[(__name__, name)]
    except KeyError:
        _mako_generate_namespaces(context)
        return context.namespaces[(__name__, name)]
def _mako_generate_namespaces(context):
    ns = runtime.TemplateNamespace('base', context._clean_inheritance_tokens(), templateuri='base_helper.tmpl', callables=None,  calling_uri=_template_uri)
    context.namespaces[(__name__, 'base')] = ns

    ns = runtime.TemplateNamespace('notes', context._clean_inheritance_tokens(), templateuri='annotation_helper.tmpl', callables=None,  calling_uri=_template_uri)
    context.namespaces[(__name__, 'notes')] = ns

def render_body(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        __M_locals = __M_dict_builtin(pageargs=pageargs)
        _import_ns = {}
        _mako_get_namespace(context, 'base')._populate(_import_ns, ['*'])
        _mako_get_namespace(context, 'notes')._populate(_import_ns, ['*'])
        luxon_locales = _import_ns.get('luxon_locales', context.get('luxon_locales', UNDEFINED))
        navigation_alt_links = _import_ns.get('navigation_alt_links', context.get('navigation_alt_links', UNDEFINED))
        def extra_head():
            return render_extra_head(context._locals(__M_locals))
        show_sourcelink = _import_ns.get('show_sourcelink', context.get('show_sourcelink', UNDEFINED))
        messages = _import_ns.get('messages', context.get('messages', UNDEFINED))
        def sourcelink():
            return render_sourcelink(context._locals(__M_locals))
        def extra_footer():
            return render_extra_footer(context._locals(__M_locals))
        translations = _import_ns.get('translations', context.get('translations', UNDEFINED))
        def belowtitle():
            return render_belowtitle(context._locals(__M_locals))
        navigation_links = _import_ns.get('navigation_links', context.get('navigation_links', UNDEFINED))
        lang = _import_ns.get('lang', context.get('lang', UNDEFINED))
        show_blog_title = _import_ns.get('show_blog_title', context.get('show_blog_title', UNDEFINED))
        blog_title = _import_ns.get('blog_title', context.get('blog_title', UNDEFINED))
        base = _mako_get_namespace(context, 'base')
        body_end = _import_ns.get('body_end', context.get('body_end', UNDEFINED))
        logo_url = _import_ns.get('logo_url', context.get('logo_url', UNDEFINED))
        def content():
            return render_content(context._locals(__M_locals))
        date_fanciness = _import_ns.get('date_fanciness', context.get('date_fanciness', UNDEFINED))
        search_form = _import_ns.get('search_form', context.get('search_form', UNDEFINED))
        _link = _import_ns.get('_link', context.get('_link', UNDEFINED))
        luxon_date_format = _import_ns.get('luxon_date_format', context.get('luxon_date_format', UNDEFINED))
        len = _import_ns.get('len', context.get('len', UNDEFINED))
        set_locale = _import_ns.get('set_locale', context.get('set_locale', UNDEFINED))
        template_hooks = _import_ns.get('template_hooks', context.get('template_hooks', UNDEFINED))
        theme_config = _import_ns.get('theme_config', context.get('theme_config', UNDEFINED))
        def extra_header():
            return render_extra_header(context._locals(__M_locals))
        content_footer = _import_ns.get('content_footer', context.get('content_footer', UNDEFINED))
        def extra_js():
            return render_extra_js(context._locals(__M_locals))
        __M_writer = context.writer()
        __M_writer('\n')
        __M_writer('\n')
        __M_writer(str(set_locale(lang)))
        __M_writer('\n')
        __M_writer(str(base.html_headstart()))
        __M_writer('\n')
        if 'parent' not in context._data or not hasattr(context._data['parent'], 'extra_head'):
            context['self'].extra_head(**pageargs)
        

        __M_writer('\n')
        __M_writer(str(template_hooks['extra_head']()))
        __M_writer('\n</head>\n<body>\n<a href="#content" class="sr-only sr-only-focusable">')
        __M_writer(str(messages("Skip to main content")))
        __M_writer('</a>\n\n<!-- Menubar -->\n\n<nav class="navbar navbar-expand-md static-top mb-4\n')
        if theme_config.get('navbar_light'):
            __M_writer('navbar-light\n')
        else:
            __M_writer('navbar-dark\n')
        if theme_config.get('navbar_custom_bg'):
            __M_writer(str(theme_config['navbar_custom_bg']))
            __M_writer('\n')
        elif theme_config.get('navbar_light'):
            __M_writer('bg-light\n')
        else:
            __M_writer('bg-dark\n')
        __M_writer('">\n    <div class="container"><!-- This keeps the margins nice -->\n        <a class="navbar-brand" href="')
        __M_writer(str(_link("root", None, lang)))
        __M_writer('">\n')
        if logo_url:
            __M_writer('            <img src="')
            __M_writer(str(logo_url))
            __M_writer('" alt="')
            __M_writer(filters.html_escape(str(blog_title)))
            __M_writer('" id="logo" class="d-inline-block align-top">\n')
        __M_writer('\n')
        if show_blog_title:
            __M_writer('            <span id="blog-title">')
            __M_writer(filters.html_escape(str(blog_title)))
            __M_writer('</span>\n')
        __M_writer('        </a>\n        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#bs-navbar" aria-controls="bs-navbar" aria-expanded="false" aria-label="Toggle navigation">\n            <span class="navbar-toggler-icon"></span>\n        </button>\n\n        <div class="collapse navbar-collapse" id="bs-navbar">\n            <ul class="navbar-nav mr-auto">\n                ')
        __M_writer(str(base.html_navigation_links_entries(navigation_links)))
        __M_writer('\n                ')
        __M_writer(str(template_hooks['menu']()))
        __M_writer('\n            </ul>\n')
        if search_form:
            __M_writer('                ')
            __M_writer(str(search_form))
            __M_writer('\n')
        __M_writer('\n            <ul class="navbar-nav navbar-right">\n                ')
        __M_writer(str(base.html_navigation_links_entries(navigation_alt_links)))
        __M_writer('\n                ')
        if 'parent' not in context._data or not hasattr(context._data['parent'], 'belowtitle'):
            context['self'].belowtitle(**pageargs)
        

        __M_writer('\n')
        if show_sourcelink:
            __M_writer('                    ')
            if 'parent' not in context._data or not hasattr(context._data['parent'], 'sourcelink'):
                context['self'].sourcelink(**pageargs)
            

            __M_writer('\n')
        __M_writer('                ')
        __M_writer(str(template_hooks['menu_alt']()))
        __M_writer('\n            </ul>\n        </div><!-- /.navbar-collapse -->\n    </div><!-- /.container -->\n</nav>\n\n<!-- End of Menubar -->\n\n<div class="container" id="content" role="main">\n    <div class="body-content">\n        <!--Body content-->\n        ')
        __M_writer(str(template_hooks['page_header']()))
        __M_writer('\n        ')
        if 'parent' not in context._data or not hasattr(context._data['parent'], 'extra_header'):
            context['self'].extra_header(**pageargs)
        

        __M_writer('\n        ')
        if 'parent' not in context._data or not hasattr(context._data['parent'], 'content'):
            context['self'].content(**pageargs)
        

        __M_writer('\n        <!--End of body content-->\n\n        <footer id="footer">\n            ')
        __M_writer(str(content_footer))
        __M_writer('\n            ')
        __M_writer(str(template_hooks['page_footer']()))
        __M_writer('\n            ')
        if 'parent' not in context._data or not hasattr(context._data['parent'], 'extra_footer'):
            context['self'].extra_footer(**pageargs)
        

        __M_writer('\n        </footer>\n    </div>\n</div>\n\n')
        __M_writer(str(base.late_load_js()))
        __M_writer('\n')
        if date_fanciness != 0:
            __M_writer('        <!-- fancy dates -->\n        <script>\n        luxon.Settings.defaultLocale = "')
            __M_writer(str(luxon_locales[lang]))
            __M_writer('";\n        fancydates(')
            __M_writer(str(date_fanciness))
            __M_writer(', ')
            __M_writer(str(luxon_date_format))
            __M_writer(');\n        </script>\n        <!-- end fancy dates -->\n')
        __M_writer('    ')
        if 'parent' not in context._data or not hasattr(context._data['parent'], 'extra_js'):
            context['self'].extra_js(**pageargs)
        

        __M_writer("\n    <script>\n    baguetteBox.run('div#content', {\n        ignoreClass: 'islink',\n        captions: function(element){var i=element.getElementsByTagName('img')[0];return i===undefined?'':i.alt;}});\n    </script>\n")
        __M_writer(str(body_end))
        __M_writer('\n')
        __M_writer(str(template_hooks['body_end']()))
        __M_writer('\n</body>\n</html>\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_extra_head(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        _import_ns = {}
        _mako_get_namespace(context, 'base')._populate(_import_ns, ['*'])
        _mako_get_namespace(context, 'notes')._populate(_import_ns, ['*'])
        def extra_head():
            return render_extra_head(context)
        __M_writer = context.writer()
        __M_writer('\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_belowtitle(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        _import_ns = {}
        _mako_get_namespace(context, 'base')._populate(_import_ns, ['*'])
        _mako_get_namespace(context, 'notes')._populate(_import_ns, ['*'])
        translations = _import_ns.get('translations', context.get('translations', UNDEFINED))
        def belowtitle():
            return render_belowtitle(context)
        base = _mako_get_namespace(context, 'base')
        len = _import_ns.get('len', context.get('len', UNDEFINED))
        __M_writer = context.writer()
        __M_writer('\n')
        if len(translations) > 1:
            __M_writer('                    <li>')
            __M_writer(str(base.html_translations()))
            __M_writer('</li>\n')
        __M_writer('                ')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_sourcelink(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        _import_ns = {}
        _mako_get_namespace(context, 'base')._populate(_import_ns, ['*'])
        _mako_get_namespace(context, 'notes')._populate(_import_ns, ['*'])
        def sourcelink():
            return render_sourcelink(context)
        __M_writer = context.writer()
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_extra_header(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        _import_ns = {}
        _mako_get_namespace(context, 'base')._populate(_import_ns, ['*'])
        _mako_get_namespace(context, 'notes')._populate(_import_ns, ['*'])
        def extra_header():
            return render_extra_header(context)
        __M_writer = context.writer()
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_content(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        _import_ns = {}
        _mako_get_namespace(context, 'base')._populate(_import_ns, ['*'])
        _mako_get_namespace(context, 'notes')._populate(_import_ns, ['*'])
        def content():
            return render_content(context)
        __M_writer = context.writer()
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_extra_footer(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        _import_ns = {}
        _mako_get_namespace(context, 'base')._populate(_import_ns, ['*'])
        _mako_get_namespace(context, 'notes')._populate(_import_ns, ['*'])
        def extra_footer():
            return render_extra_footer(context)
        __M_writer = context.writer()
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_extra_js(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        _import_ns = {}
        _mako_get_namespace(context, 'base')._populate(_import_ns, ['*'])
        _mako_get_namespace(context, 'notes')._populate(_import_ns, ['*'])
        def extra_js():
            return render_extra_js(context)
        __M_writer = context.writer()
        return ''
    finally:
        context.caller_stack._pop_frame()


"""
__M_BEGIN_METADATA
{"filename": "/home/lucy/anaconda3/envs/lucy/lib/python3.10/site-packages/nikola/data/themes/bootstrap4/templates/base.tmpl", "uri": "base.tmpl", "source_encoding": "utf-8", "line_map": {"23": 2, "26": 3, "29": 0, "72": 2, "73": 3, "74": 4, "75": 4, "76": 5, "77": 5, "82": 8, "83": 9, "84": 9, "85": 12, "86": 12, "87": 17, "88": 18, "89": 19, "90": 20, "91": 22, "92": 23, "93": 23, "94": 24, "95": 25, "96": 26, "97": 27, "98": 29, "99": 31, "100": 31, "101": 32, "102": 33, "103": 33, "104": 33, "105": 33, "106": 33, "107": 35, "108": 36, "109": 37, "110": 37, "111": 37, "112": 39, "113": 46, "114": 46, "115": 47, "116": 47, "117": 49, "118": 50, "119": 50, "120": 50, "121": 52, "122": 54, "123": 54, "128": 59, "129": 60, "130": 61, "135": 61, "136": 63, "137": 63, "138": 63, "139": 74, "140": 74, "145": 75, "150": 76, "151": 80, "152": 80, "153": 81, "154": 81, "159": 82, "160": 87, "161": 87, "162": 88, "163": 89, "164": 91, "165": 91, "166": 92, "167": 92, "168": 92, "169": 92, "170": 96, "175": 96, "176": 102, "177": 102, "178": 103, "179": 103, "185": 6, "194": 6, "200": 55, "212": 55, "213": 56, "214": 57, "215": 57, "216": 57, "217": 59, "223": 61, "237": 75, "251": 76, "265": 82, "279": 96, "293": 279}}
__M_END_METADATA
"""
