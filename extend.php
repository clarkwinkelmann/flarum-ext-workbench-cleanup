<?php

namespace ClarkWinkelmann\WorkbenchCleanup;

use Flarum\Extend;

return [
    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/resources/less/admin.less'),

    (new Extend\Routes('api'))
        ->post('/workbench-cleanup/inspect', 'workbench-cleanup.inspect', InspectController::class)
        ->post('/workbench-cleanup/clean', 'workbench-cleanup.clean', CleanController::class),
];
