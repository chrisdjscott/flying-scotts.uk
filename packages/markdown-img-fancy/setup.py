from setuptools import setup

setup(
    name='lektor-markdown-img-fancy',
    version='0.1',
    author=u'Chris Scott',
    author_email='chris@chrisdjscott.co.uk',
    license='MIT',
    py_modules=['lektor_markdown_img_fancy'],
    entry_points={
        'lektor.plugins': [
            'markdown-img-fancy = lektor_markdown_img_fancy:MarkdownImgFancyPlugin',
        ]
    },
    install_requires=['beautifulsoup4'],
)
