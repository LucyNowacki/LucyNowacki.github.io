# -*- coding:utf-8 -*-
from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
STOP_RENDERING = runtime.STOP_RENDERING
__M_dict_builtin = dict
__M_locals_builtin = locals
_magic_number = 10
_modified_time = 1700508425.606534
_enable_loop = True
_template_filename = 'themes/themeBlog/templates/post_ipynb.tmpl'
_template_uri = 'post_ipynb.tmpl'
_source_encoding = 'utf-8'
_exports = ['extra_head', 'content', 'sourcelink']


def _mako_get_namespace(context, name):
    try:
        return context.namespaces[(__name__, name)]
    except KeyError:
        _mako_generate_namespaces(context)
        return context.namespaces[(__name__, name)]
def _mako_generate_namespaces(context):
    ns = runtime.TemplateNamespace('helper', context._clean_inheritance_tokens(), templateuri='post_helper.tmpl', callables=None,  calling_uri=_template_uri)
    context.namespaces[(__name__, 'helper')] = ns

    ns = runtime.TemplateNamespace('pheader', context._clean_inheritance_tokens(), templateuri='post_header.tmpl', callables=None,  calling_uri=_template_uri)
    context.namespaces[(__name__, 'pheader')] = ns

    ns = runtime.TemplateNamespace('comments', context._clean_inheritance_tokens(), templateuri='comments_helper.tmpl', callables=None,  calling_uri=_template_uri)
    context.namespaces[(__name__, 'comments')] = ns

    ns = runtime.TemplateNamespace('math', context._clean_inheritance_tokens(), templateuri='math_helper.tmpl', callables=None,  calling_uri=_template_uri)
    context.namespaces[(__name__, 'math')] = ns

    ns = runtime.TemplateNamespace('ui', context._clean_inheritance_tokens(), templateuri='ui_helper.tmpl', callables=None,  calling_uri=_template_uri)
    context.namespaces[(__name__, 'ui')] = ns

def _mako_inherit(template, context):
    _mako_generate_namespaces(context)
    return runtime._inherit_from(context, 'base.tmpl', _template_uri)
def render_body(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        __M_locals = __M_dict_builtin(pageargs=pageargs)
        messages = context.get('messages', UNDEFINED)
        site_has_comments = context.get('site_has_comments', UNDEFINED)
        smartjoin = context.get('smartjoin', UNDEFINED)
        post = context.get('post', UNDEFINED)
        comments = _mako_get_namespace(context, 'comments')
        def sourcelink():
            return render_sourcelink(context._locals(__M_locals))
        pheader = _mako_get_namespace(context, 'pheader')
        parent = context.get('parent', UNDEFINED)
        ui = _mako_get_namespace(context, 'ui')
        def content():
            return render_content(context._locals(__M_locals))
        def extra_head():
            return render_extra_head(context._locals(__M_locals))
        math = _mako_get_namespace(context, 'math')
        helper = _mako_get_namespace(context, 'helper')
        show_sourcelink = context.get('show_sourcelink', UNDEFINED)
        __M_writer = context.writer()
        __M_writer('\n')
        __M_writer('\n')
        __M_writer('\n')
        __M_writer('\n')
        __M_writer('\n')
        __M_writer('\n\n')
        if 'parent' not in context._data or not hasattr(context._data['parent'], 'extra_head'):
            context['self'].extra_head(**pageargs)
        

        __M_writer('\n\n')
        if 'parent' not in context._data or not hasattr(context._data['parent'], 'content'):
            context['self'].content(**pageargs)
        

        __M_writer('\n\n')
        if 'parent' not in context._data or not hasattr(context._data['parent'], 'sourcelink'):
            context['self'].sourcelink(**pageargs)
        

        __M_writer('\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_extra_head(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        parent = context.get('parent', UNDEFINED)
        def extra_head():
            return render_extra_head(context)
        math = _mako_get_namespace(context, 'math')
        smartjoin = context.get('smartjoin', UNDEFINED)
        helper = _mako_get_namespace(context, 'helper')
        post = context.get('post', UNDEFINED)
        __M_writer = context.writer()
        __M_writer('\n    ')
        __M_writer(str(parent.extra_head()))
        __M_writer("\n    <meta property='og:title' content='")
        __M_writer(str(post.title()))
        __M_writer("'/>\n    <meta property='og:image' content='https://lucynowacki.github.io/images/")
        __M_writer(str(post.meta('image')))
        __M_writer("'/>\n    <meta property='og:description' content='")
        __M_writer(str(post.description()))
        __M_writer("'/>\n    <meta property='og:url' content='")
        __M_writer(str(post.permalink(absolute=True)))
        __M_writer('\'/>\n\n\n    <!-- Add Facebook SDK -->\n    <div id="fb-root"></div>\n    <script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v11.0" nonce="yourNonceValue"></script>\n    <script>\n    window.fbAsyncInit = function() {\n        FB.init({\n        appId      : \'963063331636085\', // Your Facebook App ID\n        xfbml      : true,\n        version    : \'v11.0\'\n        });\n        FB.AppEvents.logPageView();\n    };\n\n    function sharePost() {\n        FB.ui({\n        method: \'share\',\n        href: \'https://lucynowacki.github.io/blog/dynamic-mode-decomposition-for-el-nino/\', // Your blog post URL\n        }, function(response){});\n    }\n    </script>\n\n\n')
        if post.meta('keywords'):
            __M_writer('    <meta name="keywords" content="')
            __M_writer(filters.html_escape(str(smartjoin(', ', post.meta('keywords')))))
            __M_writer('">\n')
        __M_writer('    <meta name="author" content="')
        __M_writer(filters.html_escape(str(post.author())))
        __M_writer('">\n')
        if post.prev_post:
            __M_writer('        <link rel="prev" href="')
            __M_writer(str(post.prev_post.permalink()))
            __M_writer('" title="')
            __M_writer(filters.html_escape(str(post.prev_post.title())))
            __M_writer('" type="text/html">\n')
        if post.next_post:
            __M_writer('        <link rel="next" href="')
            __M_writer(str(post.next_post.permalink()))
            __M_writer('" title="')
            __M_writer(filters.html_escape(str(post.next_post.title())))
            __M_writer('" type="text/html">\n')
        if post.is_draft:
            __M_writer('        <meta name="robots" content="noindex">\n')
        __M_writer('    ')
        __M_writer(str(helper.open_graph_metadata(post)))
        __M_writer('\n    ')
        __M_writer(str(helper.twitter_card_information(post)))
        __M_writer('\n    ')
        __M_writer(str(helper.meta_translations(post)))
        __M_writer('\n    ')
        __M_writer(str(math.math_styles_ifpost(post)))
        __M_writer('\n    <link rel="stylesheet" href="../../assets/css/post_ipynb.css">\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_content(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        messages = context.get('messages', UNDEFINED)
        site_has_comments = context.get('site_has_comments', UNDEFINED)
        post = context.get('post', UNDEFINED)
        comments = _mako_get_namespace(context, 'comments')
        pheader = _mako_get_namespace(context, 'pheader')
        def content():
            return render_content(context)
        math = _mako_get_namespace(context, 'math')
        helper = _mako_get_namespace(context, 'helper')
        __M_writer = context.writer()
        __M_writer('\n<article class="post-')
        __M_writer(str(post.meta('type')))
        __M_writer(' h-entry hentry postpage" itemscope="itemscope" itemtype="http://schema.org/Article">\n    ')
        __M_writer(str(pheader.html_post_header()))
        __M_writer('\n    <div class="e-content entry-content" itemprop="articleBody text">\n    ')
        __M_writer(str(post.text()))
        __M_writer('\n    </div>\n\n<div class="socials">\n\n        <!-- Facebook share button -->\n        <a href="#" id="fb-share-button">Share on Facebook</a>\n\n        <!-- LinkedIn share button -->\n        <a href="#" id="linkedin-share-button">Share on LinkedIn</a>\n\n</div>\n\n    <aside class="postpromonav">\n    <nav>\n    ')
        __M_writer(str(helper.html_tags(post)))
        __M_writer('\n    ')
        __M_writer(str(helper.html_pager(post)))
        __M_writer('\n    </nav>\n    </aside>\n')
        if not post.meta('nocomments') and site_has_comments:
            __M_writer('        <section class="comments hidden-print">\n        <h2>')
            __M_writer(str(messages("Comments")))
            __M_writer('</h2>\n        ')
            __M_writer(str(comments.comment_form(post.permalink(absolute=True), post.title(), post._base_path)))
            __M_writer('\n        </section>\n')
        __M_writer('    ')
        __M_writer(str(math.math_scripts_ifpost(post)))
        __M_writer('\n    \n    <!-- JavaScript for Facebook share button -->\n    <script>\n    document.getElementById(\'fb-share-button\').onclick = function() {\n        var postUrl = encodeURIComponent(window.location.href);\n        var facebookShareUrl = \'https://www.facebook.com/sharer/sharer.php?u=\' + postUrl;\n        window.open(facebookShareUrl, \'_blank\');\n    }\n\n    // JavaScript for LinkedIn share button\n    document.getElementById(\'linkedin-share-button\').onclick = function() {\n        var postUrl = encodeURIComponent(window.location.href);\n        var linkedinShareUrl = \'https://www.linkedin.com/shareArticle?mini=true&url=\' + postUrl;\n        window.open(linkedinShareUrl, \'_blank\');\n    }\n\n    </script>\n\n    <!-- Add the image -->\n    <img src="https://lucynowacki.github.io/images/')
        __M_writer(str(post.meta('image')))
        __M_writer('" alt="Description of image">\n</article>\n')
        __M_writer(str(comments.comment_link_script()))
        __M_writer('\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_sourcelink(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        ui = _mako_get_namespace(context, 'ui')
        post = context.get('post', UNDEFINED)
        show_sourcelink = context.get('show_sourcelink', UNDEFINED)
        def sourcelink():
            return render_sourcelink(context)
        __M_writer = context.writer()
        __M_writer('\n')
        if show_sourcelink:
            __M_writer('    ')
            __M_writer(str(ui.show_sourcelink(post.source_link())))
            __M_writer('\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


"""
__M_BEGIN_METADATA
{"filename": "themes/themeBlog/templates/post_ipynb.tmpl", "uri": "post_ipynb.tmpl", "source_encoding": "utf-8", "line_map": {"23": 2, "26": 3, "29": 4, "32": 5, "35": 6, "41": 0, "63": 2, "64": 3, "65": 4, "66": 5, "67": 6, "68": 7, "73": 57, "78": 111, "83": 117, "89": 9, "100": 9, "101": 10, "102": 10, "103": 11, "104": 11, "105": 12, "106": 12, "107": 13, "108": 13, "109": 14, "110": 14, "111": 39, "112": 40, "113": 40, "114": 40, "115": 42, "116": 42, "117": 42, "118": 43, "119": 44, "120": 44, "121": 44, "122": 44, "123": 44, "124": 46, "125": 47, "126": 47, "127": 47, "128": 47, "129": 47, "130": 49, "131": 50, "132": 52, "133": 52, "134": 52, "135": 53, "136": 53, "137": 54, "138": 54, "139": 55, "140": 55, "146": 59, "159": 59, "160": 60, "161": 60, "162": 61, "163": 61, "164": 63, "165": 63, "166": 78, "167": 78, "168": 79, "169": 79, "170": 82, "171": 83, "172": 84, "173": 84, "174": 85, "175": 85, "176": 88, "177": 88, "178": 88, "179": 108, "180": 108, "181": 110, "182": 110, "188": 113, "197": 113, "198": 114, "199": 115, "200": 115, "201": 115, "207": 201}}
__M_END_METADATA
"""
