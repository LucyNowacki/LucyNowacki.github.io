# -*- coding:utf-8 -*-
from mako import runtime, filters, cache
UNDEFINED = runtime.UNDEFINED
STOP_RENDERING = runtime.STOP_RENDERING
__M_dict_builtin = dict
__M_locals_builtin = locals
_magic_number = 10
_modified_time = 1690191773.3692603
_enable_loop = True
_template_filename = 'themes/themeBlog/templates/post.tmpl'
_template_uri = 'post.tmpl'
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
        def sourcelink():
            return render_sourcelink(context._locals(__M_locals))
        math = _mako_get_namespace(context, 'math')
        parent = context.get('parent', UNDEFINED)
        pheader = _mako_get_namespace(context, 'pheader')
        def extra_head():
            return render_extra_head(context._locals(__M_locals))
        smartjoin = context.get('smartjoin', UNDEFINED)
        def content():
            return render_content(context._locals(__M_locals))
        site_has_comments = context.get('site_has_comments', UNDEFINED)
        abs_link = context.get('abs_link', UNDEFINED)
        show_sourcelink = context.get('show_sourcelink', UNDEFINED)
        post = context.get('post', UNDEFINED)
        comments = _mako_get_namespace(context, 'comments')
        helper = _mako_get_namespace(context, 'helper')
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
        post = context.get('post', UNDEFINED)
        math = _mako_get_namespace(context, 'math')
        parent = context.get('parent', UNDEFINED)
        helper = _mako_get_namespace(context, 'helper')
        def extra_head():
            return render_extra_head(context)
        smartjoin = context.get('smartjoin', UNDEFINED)
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
        __M_writer('\n')
        return ''
    finally:
        context.caller_stack._pop_frame()


def render_content(context,**pageargs):
    __M_caller = context.caller_stack._push_frame()
    try:
        messages = context.get('messages', UNDEFINED)
        math = _mako_get_namespace(context, 'math')
        pheader = _mako_get_namespace(context, 'pheader')
        def content():
            return render_content(context)
        site_has_comments = context.get('site_has_comments', UNDEFINED)
        abs_link = context.get('abs_link', UNDEFINED)
        post = context.get('post', UNDEFINED)
        comments = _mako_get_namespace(context, 'comments')
        helper = _mako_get_namespace(context, 'helper')
        __M_writer = context.writer()
        __M_writer('\n<article class="post-')
        __M_writer(str(post.meta('type')))
        __M_writer(' h-entry hentry postpage" itemscope="itemscope" itemtype="http://schema.org/Article">\n    ')
        __M_writer(str(pheader.html_post_header()))
        __M_writer('\n    <div class="e-content entry-content" itemprop="articleBody text">\n    ')
        __M_writer(str(post.text()))
        __M_writer('\n    </div>\n\n<div class="socials">\n\n    <a href="https://www.linkedin.com/shareArticle?url=')
        __M_writer(str(abs_link(post.permalink())))
        __M_writer('&source=www.bentasker.co.uk"\n    target=_blank \n    rel="noopener nofollow"\n    >\n        <img class="linkedinimg" \n            loading="lazy"\n            src="/images/social-icons/linkedin.jpg"\n            alt="Share this post on LinkedIN"\n            title="Share this post on LinkedIN"\n            >\n    </a>\n\n    <a href="https://twitter.com/share?text=')
        __M_writer(filters.html_escape(str(post.title())))
        __M_writer('&url=')
        __M_writer(str(abs_link(post.permalink())))
        __M_writer('&via=bentasker" target=_blank rel="noopener nofollow">\n        <img class="twitterimg" \n             loading="lazy" src="/images/social-icons/share-on-twitter-button-icon.png" alt="Share this post on Twitter" title="Share this post on Twitter">\n    </a>\n\n    <a href="https://www.reddit.com/submit?url=')
        __M_writer(str(abs_link(post.permalink())))
        __M_writer('&title=')
        __M_writer(filters.html_escape(str(post.title())))
        __M_writer('" target=_blank rel="noopener nofollow">\n        <img class="redditimg" \n             loading="lazy" src="/images/social-icons/reddit-share-button-icon.png" alt="Share this post on Reddit" title="Share this post on Reddit">\n    </a>\n\n\n\n    <a href="https://api.whatsapp.com/send?text=')
        __M_writer(str(abs_link(post.permalink())))
        __M_writer('" target=_blank rel="noopener nofollow">\n        <img class="whatsappimg"\n             loading="lazy" src="/images/social-icons/whatsapp-share-button-icon.png" alt="Share this post via Whatsapp" title="Share this post via Whatsapp">\n    </a>\n\n    <a href="https://t.me/share/url?url=')
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
        __M_writer('" target=_blank rel="noopener nofollow">\n        <img class="emailimg"\n             loading="lazy" src="/images/social-icons/email.jpg" alt="Share this post via Email" title="Share this post via Email">\n    </a>\n\n</div>\n\n    \n    <aside class="postpromonav">\n    <nav>\n    ')
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
        show_sourcelink = context.get('show_sourcelink', UNDEFINED)
        def sourcelink():
            return render_sourcelink(context)
        ui = _mako_get_namespace(context, 'ui')
        post = context.get('post', UNDEFINED)
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
{"filename": "themes/themeBlog/templates/post.tmpl", "uri": "post.tmpl", "source_encoding": "utf-8", "line_map": {"23": 2, "26": 3, "29": 4, "32": 5, "35": 6, "41": 0, "64": 2, "65": 3, "66": 4, "67": 5, "68": 6, "69": 7, "74": 28, "79": 115, "84": 121, "90": 9, "101": 9, "102": 10, "103": 10, "104": 11, "105": 12, "106": 12, "107": 12, "108": 14, "109": 14, "110": 14, "111": 15, "112": 16, "113": 16, "114": 16, "115": 16, "116": 16, "117": 18, "118": 19, "119": 19, "120": 19, "121": 19, "122": 19, "123": 21, "124": 22, "125": 24, "126": 24, "127": 24, "128": 25, "129": 25, "130": 26, "131": 26, "132": 27, "133": 27, "139": 30, "153": 30, "154": 31, "155": 31, "156": 32, "157": 32, "158": 34, "159": 34, "160": 39, "161": 39, "162": 51, "163": 51, "164": 51, "165": 51, "166": 56, "167": 56, "168": 56, "169": 56, "170": 63, "171": 63, "172": 68, "173": 68, "174": 68, "175": 68, "176": 80, "177": 80, "178": 80, "179": 80, "180": 92, "181": 92, "182": 92, "183": 92, "184": 102, "185": 102, "186": 103, "187": 103, "188": 106, "189": 107, "190": 108, "191": 108, "192": 109, "193": 109, "194": 112, "195": 112, "196": 112, "197": 114, "198": 114, "204": 117, "213": 117, "214": 118, "215": 119, "216": 119, "217": 119, "223": 217}}
__M_END_METADATA
"""
