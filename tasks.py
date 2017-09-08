from __future__ import unicode_literals

import os
import shutil

import invoke

from lektor.builder import Builder
from lektor.cli import Context
from lektor.reporter import CliReporter


ROOT_DIR = os.path.dirname(__file__)
OUTPUT_DIR = os.path.join(ROOT_DIR, 'build')


@invoke.task
def build(ctx):
    lektor_cli_ctx = Context()
    lektor_cli_ctx.load_plugins()

    env = lektor_cli_ctx.get_env()
    pad = env.new_pad()

    # This is essentially `lektor build --output-path build`.
    with CliReporter(env, verbosity=0):
        builder = Builder(pad, OUTPUT_DIR)
        failures = builder.build_all()

    if failures:
        raise invoke.Exit('Builder failed.')

    # copy redirect file for netlify
    redirect_input = os.path.join(ROOT_DIR, "redirects.txt")
    redirect_output = os.path.join(OUTPUT_DIR, '_redirects')
    shutil.copy(redirect_input, redirect_output)
