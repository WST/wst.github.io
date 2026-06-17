# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'Knowledge Base'
copyright = '2026, Ilya Averkov'
author = 'Ilya Averkov'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = ["sphinx_rtd_dark_mode"]

templates_path = ['_templates']
exclude_patterns = []



# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']

# Favicon configuration
html_favicon = 'https://wst.github.io/static/icon.png'
# html_logo = 'https://wst.github.io/static/icon.png'

# Disable "Show Page Source" functionality
html_show_sourcelink = False

# Exclude source files from build
html_copy_source = False

# Add custom CSS
html_css_files = [
    'css/swiper-custom.css',
    'css/dark-theme-links.css',
]

# Add custom JavaScript
html_js_files = [
    # 'js/slider.js',  # Custom slider
    'js/swiper-slider.js',  # Swiper.js slider
]

# user starts in dark mode
default_dark_mode = True
