# -*- coding:utf-8 -*-
from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
STOP_RENDERING = runtime.STOP_RENDERING
__M_dict_builtin = dict
__M_locals_builtin = locals
_magic_number = 10
_modified_time = 1739188707.26054
_enable_loop = True
_template_filename = '/home/lucy/anaconda3/envs/lucy/lib/python3.11/site-packages/nikola/data/themes/bootstrap4/templates/base.tmpl'
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

def render_body(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        __M_locals = __M_dict_builtin(pageargs=pageargs)
        _import_ns = {}
        _mako_get_namespace(context, 'base')._populate(_import_ns, ['*'])
        logo_url = _import_ns.get('logo_url', context.get('logo_url', UNDEFINED))
        def extra_head():
            return render_extra_head(context._locals(__M_locals))
        date_fanciness = _import_ns.get('date_fanciness', context.get('date_fanciness', UNDEFINED))
        luxon_date_format = _import_ns.get('luxon_date_format', context.get('luxon_date_format', UNDEFINED))
        def extra_footer():
            return render_extra_footer(context._locals(__M_locals))
        luxon_locales = _import_ns.get('luxon_locales', context.get('luxon_locales', UNDEFINED))
        def content():
            return render_content(context._locals(__M_locals))
        content_footer = _import_ns.get('content_footer', context.get('content_footer', UNDEFINED))
        def extra_js():
            return render_extra_js(context._locals(__M_locals))
        def sourcelink():
            return render_sourcelink(context._locals(__M_locals))
        theme_config = _import_ns.get('theme_config', context.get('theme_config', UNDEFINED))
        messages = _import_ns.get('messages', context.get('messages', UNDEFINED))
        def belowtitle():
            return render_belowtitle(context._locals(__M_locals))
        base = _mako_get_namespace(context, 'base')
        translations = _import_ns.get('translations', context.get('translations', UNDEFINED))
        set_locale = _import_ns.get('set_locale', context.get('set_locale', UNDEFINED))
        navigation_links = _import_ns.get('navigation_links', context.get('navigation_links', UNDEFINED))
        template_hooks = _import_ns.get('template_hooks', context.get('template_hooks', UNDEFINED))
        lang = _import_ns.get('lang', context.get('lang', UNDEFINED))
        _link = _import_ns.get('_link', context.get('_link', UNDEFINED))
        len = _import_ns.get('len', context.get('len', UNDEFINED))
        search_form = _import_ns.get('search_form', context.get('search_form', UNDEFINED))
        blog_title = _import_ns.get('blog_title', context.get('blog_title', UNDEFINED))
        show_blog_title = _import_ns.get('show_blog_title', context.get('show_blog_title', UNDEFINED))
        show_sourcelink = _import_ns.get('show_sourcelink', context.get('show_sourcelink', UNDEFINED))
        def extra_header():
            return render_extra_header(context._locals(__M_locals))
        navigation_alt_links = _import_ns.get('navigation_alt_links', context.get('navigation_alt_links', UNDEFINED))
        body_end = _import_ns.get('body_end', context.get('body_end', UNDEFINED))
        __M_writer = context.writer()
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
        translations = _import_ns.get('translations', context.get('translations', UNDEFINED))
        len = _import_ns.get('len', context.get('len', UNDEFINED))
        def belowtitle():
            return render_belowtitle(context)
        base = _mako_get_namespace(context, 'base')
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
        def extra_js():
            return render_extra_js(context)
        __M_writer = context.writer()
        return ''
    finally:
        context.caller_stack._pop_frame()


"""
__M_BEGIN_METADATA
{"filename": "/home/lucy/anaconda3/envs/lucy/lib/python3.11/site-packages/nikola/data/themes/bootstrap4/templates/base.tmpl", "uri": "base.tmpl", "source_encoding": "utf-8", "line_map": {"23": 2, "26": 0, "68": 2, "69": 3, "70": 3, "71": 4, "72": 4, "77": 7, "78": 8, "79": 8, "80": 11, "81": 11, "82": 16, "83": 17, "84": 18, "85": 19, "86": 21, "87": 22, "88": 22, "89": 23, "90": 24, "91": 25, "92": 26, "93": 28, "94": 30, "95": 30, "96": 31, "97": 32, "98": 32, "99": 32, "100": 32, "101": 32, "102": 34, "103": 35, "104": 36, "105": 36, "106": 36, "107": 38, "108": 45, "109": 45, "110": 46, "111": 46, "112": 48, "113": 49, "114": 49, "115": 49, "116": 51, "117": 53, "118": 53, "123": 58, "124": 59, "125": 60, "130": 60, "131": 62, "132": 62, "133": 62, "134": 73, "135": 73, "140": 74, "145": 75, "146": 79, "147": 79, "148": 80, "149": 80, "154": 81, "155": 86, "156": 86, "157": 87, "158": 88, "159": 90, "160": 90, "161": 91, "162": 91, "163": 91, "164": 91, "165": 95, "170": 95, "171": 101, "172": 101, "173": 102, "174": 102, "180": 5, "188": 5, "194": 54, "205": 54, "206": 55, "207": 56, "208": 56, "209": 56, "210": 58, "216": 60, "229": 74, "242": 75, "255": 81, "268": 95, "281": 268}}
__M_END_METADATA
"""
