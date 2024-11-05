# Workbench Cleanup

[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/clarkwinkelmann/flarum-ext-workbench-cleanup/blob/master/LICENSE.md) [![Latest Stable Version](https://img.shields.io/packagist/v/clarkwinkelmann/flarum-ext-workbench-cleanup.svg)](https://packagist.org/packages/clarkwinkelmann/flarum-ext-workbench-cleanup) [![Total Downloads](https://img.shields.io/packagist/dt/clarkwinkelmann/flarum-ext-workbench-cleanup.svg)](https://packagist.org/packages/clarkwinkelmann/flarum-ext-workbench-cleanup) [![Donate](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.me/clarkwinkelmann)

Offers a simple page to inspect the space used by folders in the development workbench folder with quick shortcuts to delete `node_modules` and `vendor` sub-folders to free up space.

The list of folders to scan will be automatically pulled from `composer.json`, looking for any repository of `type`: `path`.
Alternatively, a list of folders can be specified in the admin panel, those folders can be any path on disk, not restricted to Flarum installation root.

All features are restricted to admin users only so it should be safe even if you use it on publicly accessible forums, though I would not recommend it.
Note than an admin can bring offline the forum or other Composer-based apps on the server by modifying the folder to point to a Flarum installation root and deleting the production `vendor` folder.
All data deleted by the extension can be restored by running `composer install` (and `yarn install` / `npm i`) again.

Known limitations:

- If an extension uses unconventional or multiple javascript source folders, the additional `node_module` folders will not be picked up, they will count as code in the total and will not be deleted when clearing all.
- The more data the workbench folder contains, the longer the list will take to load. You might need to adjust your max execution time.
- All strings have been hard-coded, the extension cannot be translated.

## Requirements

This extension was designed for my personal development setup on Linux but might work on other Unix-compatible systems.

- Operating system with forward-slash folder paths
- `du` (disk usage) command-line utility
- PHP 8.0+
- `shell_exec` PHP access
- Flarum 1.2+ (but can scan older forums on the same server by specifying custom workbench folders)

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
