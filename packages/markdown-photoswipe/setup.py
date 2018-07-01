from setuptools import setup

setup(
    name='lektor-markdown-photoswipe',
    version='0.1',
    author=u'Chris Scott',
    author_email='chris@chrisdjscott.co.uk',
    license='MIT',
    py_modules=['lektor_markdown_photoswipe'],
    entry_points={
        'lektor.plugins': [
            'markdown-photoswipe = lektor_markdown_photoswipe:MarkdownPhotoswipePlugin',
        ]
    },
    install_requires=['beautifulsoup4'],
)
