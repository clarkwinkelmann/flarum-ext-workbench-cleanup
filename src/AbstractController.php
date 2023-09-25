<?php

namespace ClarkWinkelmann\WorkbenchCleanup;

use Flarum\Foundation\Paths;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Arr;
use Psr\Http\Server\RequestHandlerInterface;

abstract class AbstractController implements RequestHandlerInterface
{
    public function __construct(
        protected Paths      $paths,
        protected Filesystem $filesystem
    )
    {
        //
    }

    protected function getWorkbenchFolders(): array
    {
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
