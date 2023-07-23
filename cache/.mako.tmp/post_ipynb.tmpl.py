# -*- coding:utf-8 -*-
from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
STOP_RENDERING = runtime.STOP_RENDERING
__M_dict_builtin = dict
__M_locals_builtin = locals
_magic_number = 10
_modified_time = 1690132625.9769769
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
        def content():
            return render_content(context._locals(__M_locals))
        def sourcelink():
            return render_sourcelink(context._locals(__M_locals))
        pheader = _mako_get_namespace(context, 'pheader')
        smartjoin = context.get('smartjoin', UNDEFINED)
        abs_link = context.get('abs_link', UNDEFINED)
        helper = _mako_get_namespace(context, 'helper')
        messages = context.get('messages', UNDEFINED)
        comments = _mako_get_namespace(context, 'comments')
        def extra_head():
            return render_extra_head(context._locals(__M_locals))
        math = _mako_get_namespace(context, 'math')
        parent = context.get('parent', UNDEFINED)
        show_sourcelink = context.get('show_sourcelink', UNDEFINED)
        site_has_comments = context.get('site_has_comments', UNDEFINED)
        post = context.get('post', UNDEFINED)
        ui = _mako_get_namespace(context, 'ui')
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
        def extra_head():
            return render_extra_head(context)
        math = _mako_get_namespace(context, 'math')
        parent = context.get('parent', UNDEFINED)
        post = context.get('post', UNDEFINED)
        smartjoin = context.get('smartjoin', UNDEFINED)
        helper = _mako_get_namespace(context, 'helper')
        __M_writer = context.writer()
        __M_writer('\n    ')
        __M_writer(str(parent.extra_head()))
        __M_writer('\n')
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
        def content():
            return render_content(context)
        pheader = _mako_get_namespace(context, 'pheader')
        abs_link = context.get('abs_link', UNDEFINED)
        helper = _mako_get_namespace(context, 'helper')
        messages = context.get('messages', UNDEFINED)
        comments = _mako_get_namespace(context, 'comments')
        math = _mako_get_namespace(context, 'math')
        site_has_comments = context.get('site_has_comments', UNDEFINED)
        post = context.get('post', UNDEFINED)
        __M_writer = context.writer()
        __M_writer('\n<article class="post-')
        __M_writer(str(post.meta('type')))
        __M_writer(' h-entry hentry postpage" itemscope="itemscope" itemtype="http://schema.org/Article">\n    ')
        __M_writer(str(pheader.html_post_header()))
        __M_writer('\n    <div class="e-content entry-content" itemprop="articleBody text">\n    ')
        __M_writer(str(post.text()))
        __M_writer('\n    </div>\n\n<div class="socials">\n    <a href="https://twitter.com/share?text=')
        __M_writer(filters.html_escape(str(post.title())))
        __M_writer('&url=')
        __M_writer(str(abs_link(post.permalink())))
        __M_writer('&via=bentasker" target=_blank rel="noopener nofollow">\n        <img class="twitterimg" \n             loading="lazy" src="/images/social-icons/share-on-twitter-button-icon.png" alt="Share this post on Twitter" title="Share this post on Twitter">\n    </a>\n\n    <a href="https://www.reddit.com/submit?url=')
        __M_writer(str(abs_link(post.permalink())))
        __M_writer('&title=')
        __M_writer(filters.html_escape(str(post.title())))
        __M_writer('" target=_blank rel="noopener nofollow">\n        <img class="redditimg" \n             loading="lazy" src="images/social-icons/reddit-share-button-icon.png" alt="Share this post on Reddit" title="Share this post on Reddit">\n    </a>\n\n    <a href="https://www.linkedin.com/shareArticle?mini=true&url=')
        __M_writer(str(abs_link(post.permalink())))
        __M_writer('&title=')
        __M_writer(filters.html_escape(str(post.title())))
        __M_writer('&summary=This%20is%20a%20summary%20of%20my%20blog%20post.&source=LucyNowacki.github.io" target=_blank rel="noopener nofollow">\n        <img class="linkedinimg" \n            loading="lazy" src="/images/social-icons/linkedin-share-button-icon.png" alt="Share this post on LinkedIN" title="Share this post on LinkedIN">\n    </a>\n\n\n    <a href="https://api.whatsapp.com/send?text=')
        __M_writer(str(abs_link(post.permalink())))
        __M_writer('" target=_blank rel="noopener nofollow">\n        <img class="whatsappimg"\n             loading="lazy" src="/es/social-icons/whatsapp-share-button-icon.png" alt="Share this post via Whatsapp" title="Share this post via Whatsapp">\n    </a>\n\n    <a href="https://t.me/share/url?url=')
        __M_writer(str(abs_link(post.permalink())))
        __M_writer('&text=')
        __M_writer(filters.html_escape(str(post.title())))
        __M_writer('"\n    target=_blank \n    rel="noopener nofollow"\n    >\n        <img class="telegramimg" \n            loading="lazy"\n            src="/images/social-icons/telegram-icon.png"\n            alt="Share this post via Telegram"\n            title="Share this post via Telegram"\n            >\n    </a>\n\n    <a href="https://connect.qq.com/widget/shareqq/index.html?url=')
        __M_writer(str(abs_link(post.permalink())))
        __M_writer('&title=')
        __M_writer(filters.html_escape(str(post.title())))
        __M_writer('"\n    target=_blank \n    rel="noopener nofollow"\n    >\n        <img class="qqimg" \n            loading="lazy"\n            src="/images/social-icons/qq.jpg"\n            alt="Share this post via QQ"\n            title="Share this post via QQ"\n            >\n    </a>\n\n    <a href="mailto:?subject=')
        __M_writer(filters.html_escape(str(post.title())))
        __M_writer('&body=')
        __M_writer(str(abs_link(post.permalink())))
        __M_writer('" target=_blank rel="noopener nofollow">\n        <img class="emailimg"\n             loading="lazy" src="/images/social-icons/email.jpg" alt="Share this post via Email" title="Share this post via Email">\n    </a>\n\n</div>\n\n    <aside class="postpromonav">\n    <nav>\n    ')
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
        __M_writer('\n</article>\n')
        __M_writer(str(comments.comment_link_script()))
        __M_writer('\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_sourcelink(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        post = context.get('post', UNDEFINED)
        def sourcelink():
            return render_sourcelink(context)
        show_sourcelink = context.get('show_sourcelink', UNDEFINED)
        ui = _mako_get_namespace(context, 'ui')
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
{"filename": "themes/themeBlog/templates/post_ipynb.tmpl", "uri": "post_ipynb.tmpl", "source_encoding": "utf-8", "line_map": {"23": 2, "26": 3, "29": 4, "32": 5, "35": 6, "41": 0, "64": 2, "65": 3, "66": 4, "67": 5, "68": 6, "69": 7, "74": 29, "79": 106, "84": 112, "90": 9, "101": 9, "102": 10, "103": 10, "104": 11, "105": 12, "106": 12, "107": 12, "108": 14, "109": 14, "110": 14, "111": 15, "112": 16, "113": 16, "114": 16, "115": 16, "116": 16, "117": 18, "118": 19, "119": 19, "120": 19, "121": 19, "122": 19, "123": 21, "124": 22, "125": 24, "126": 24, "127": 24, "128": 25, "129": 25, "130": 26, "131": 26, "132": 27, "133": 27, "139": 31, "153": 31, "154": 32, "155": 32, "156": 33, "157": 33, "158": 35, "159": 35, "160": 39, "161": 39, "162": 39, "163": 39, "164": 44, "165": 44, "166": 44, "167": 44, "168": 49, "169": 49, "170": 49, "171": 49, "172": 55, "173": 55, "174": 60, "175": 60, "176": 60, "177": 60, "178": 72, "179": 72, "180": 72, "181": 72, "182": 84, "183": 84, "184": 84, "185": 84, "186": 93, "187": 93, "188": 94, "189": 94, "190": 97, "191": 98, "192": 99, "193": 99, "194": 100, "195": 100, "196": 103, "197": 103, "198": 103, "199": 105, "200": 105, "206": 108, "215": 108, "216": 109, "217": 110, "218": 110, "219": 110, "225": 219}}
__M_END_METADATA
"""
