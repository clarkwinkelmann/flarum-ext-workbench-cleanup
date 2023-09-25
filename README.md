# Workbench Cleanup

[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/clarkwinkelmann/flarum-ext-workbench-cleanup/blob/master/LICENSE.md) [![Latest Stable Version](https://img.shields.io/packagist/v/clarkwinkelmann/flarum-ext-workbench-cleanup.svg)](https://packagist.org/packages/clarkwinkelmann/flarum-ext-workbench-cleanup) [![Total Downloads](https://img.shields.io/packagist/dt/clarkwinkelmann/flarum-ext-workbench-cleanup.svg)](https://packagist.org/packages/clarkwinkelmann/flarum-ext-workbench-cleanup) [![Donate](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.me/clarkwinkelmann)

Offers a simple page to inspect the space used by `node_modules` and `vendor` folders in the development workbench folder with quick shortcuts to delete them to free up space.

Only supports workbench folders defined with the syntax `"url": "workbench/*/"`.
Different folder names or multiple folders will be automatically picked up.

All features are restricted to admin users only so it should be safe even if you use it on publicly accessible forums.

Known limitations:

- The list does not update automatically when you delete something
- Extension folders with neither a `vendor` nor `node_modules` folder will not appear in the list
- All strings have been hard-coded, the extension cannot be translated

## Requirements

This extension was only designed for my personal development setup on Linux but might work on other Unix-compatible systems.

- Operating system with forward-slash folder paths
- `du` (disk usage) command-line utility
- PHP 8.0+
- `shell_exec` PHP access
- Flarum 1.2+

## Installation

    composer require clarkwinkelmann/flarum-ext-workbench-cleanup

## Support

This extension is under **minimal maintenance**.

It was developed for a client and released as open-source for the benefit of the community.
I might publish simple bugfixes or compatibility updates for free.

You can [contact me](https://clarkwinkelmann.com/flarum) to sponsor additional features or updates.

Support is offered on a "best effort" basis through the Flarum community thread.

## Links

- [GitHub](https://github.com/clarkwinkelmann/flarum-ext-workbench-cleanup)
- [Packagist](https://packagist.org/packages/clarkwinkelmann/flarum-ext-workbench-cleanup)
