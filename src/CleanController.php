<?php

namespace ClarkWinkelmann\WorkbenchCleanup;

use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class CleanController extends AbstractController
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        RequestUtil::getActor($request)->assertAdmin();

        $folder = (string)Arr::get($request->getParsedBody(), 'folder');

        if (!in_array($folder, $this->getWorkbenchFolders())) {
            return new JsonResponse([
                'error' => 'Invalid folder',
            ], 400);
        }

        $type = (string)Arr::get($request->getParsedBody(), 'type');

        if (!in_array($type, ['vendor', 'node_modules'])) {
            return new JsonResponse([
                'error' => 'Invalid type',
            ], 400);
        }

        $pathType = $type;

        if ($type === 'node_modules') {
            $pathType = 'js/node_modules';
        }

        $extensionFolders = $this->filesystem->directories($folder);

        $extension = (string)Arr::get($request->getParsedBody(), 'extension');

        if ($extension !== '*' && !in_array("$folder/$extension", $extensionFolders)) {
            return new JsonResponse([
                'error' => 'Invalid extension',
            ], 400);
        }

        $deleted = [];

        foreach (($extension === '*' ? $extensionFolders : ["$folder/$extension"]) as $extensionFolder) {
            $path = "$extensionFolder/$pathType";

            if ($this->filesystem->deleteDirectory($path)) {
                $deleted[] = [
                    'folder' => $folder,
                    'extension' => $extension === '*' ? Arr::last(explode('/', $extensionFolder)) : $extension,
                    'type' => $type,
                ];
            }
        }

        return new JsonResponse([
            'deleted' => $deleted,
        ]);
    }
}
