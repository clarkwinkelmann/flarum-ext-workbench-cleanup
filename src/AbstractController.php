<?php

namespace ClarkWinkelmann\WorkbenchCleanup;

use Flarum\Foundation\Paths;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Arr;
use Psr\Http\Server\RequestHandlerInterface;

abstract class AbstractController implements RequestHandlerInterface
{
    public function __construct(
        protected SettingsRepositoryInterface $settings,
        protected Paths                       $paths,
        protected Filesystem                  $filesystem
    )
    {
        //
    }

    protected function getWorkbenchFolders(): array
    {
        $custom = trim($this->settings->get('workbench-cleanup.folders'));

        if ($custom) {
            return explode("\n", $custom);
        }

        $composer = json_decode($this->filesystem->get($this->paths->vendor . '/../composer.json'), true);

        $folders = [];

        foreach (Arr::get($composer, 'repositories', []) as $repository) {
            if (Arr::get($repository, 'type') !== 'path') {
                continue;
            }

            if (preg_match('~^(.+)/\*/$~', Arr::get($repository, 'url'), $matches) !== 1) {
                continue;
            }

            $folders[] = realpath($this->paths->vendor . '/../' . $matches[1]);
        }

        return $folders;
    }
}
