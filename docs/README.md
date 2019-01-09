# Jekyll Cayman theme

This is a [Jekyll][1] theme for [@jasonlong][2]'s [Cayman theme][4] on [GitHub Pages][3].

Cayman is a clean, responsive theme for [GitHub Pages](https://pages.github.com). This theme is available as an option if you use the [Automatic Page Generator](https://help.github.com/articles/creating-pages-with-the-automatic-generator/) or you can copy the template and styles to use on your own.

You can preview the theme at https://jasonlong.github.io/cayman-theme or with real content at https://jasonlong.github.io/geo_pattern.

![](https://cl.ly/image/1T3r3d18311V/content)

# How to use it?

Download the theme @ https://github.com/pietromenna/jekyll-cayman-theme/archive/master.zip

Unzip it and use it as a regular jekyll folder.

```
$ unzip jekyll-cayman-theme-master.zip
```

Get inside the newly extracted folder
```
$ cd jekyll-cayman-theme-master
```

Get the required gems
```
$ bundle install
```

Use it!

```
$ jekyll serve
```

For more details read about [Jekyll][1] on its web page.

# Setup

Some important configuration can be done in the file `_config.yml`. Please, check the Setup section in that file.


## baseurl

`baseurl` parameter is required in the case the site doesn't sit on the root of the domain. For example: https://pietromenna.github.io/jekyll-cayman-theme

In the case above the baseurl should be set to "/jekyll-cayman-theme".

In the case the site sits in the root, you can leave `baseurl` as empty "".

# Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/pietromenna/jekyll-cayman-theme.

# Development

To set up your environment to develop this theme, run `bundle install`.

Your theme is setup just like a normal Jekyll site! To test your theme, run `bundle exec jekyll serve` and open your browser at `http://localhost:4000`. This starts a Jekyll server using your theme. Add pages, documents, data, etc. like normal to test your theme's contents. As you make modifications to your theme and to your content, your site will regenerate and you should see the changes in the browser after a refresh, just like normal.

# License

This work is licensed under a [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/) license.

[1]: https://jekyllrb.com/
[2]: https://github.com/jasonlong
[3]: https://pages.github.com/
[4]: https://github.com/jasonlong/cayman-theme
