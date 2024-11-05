<?php

namespace ClarkWinkelmann\WorkbenchCleanup;

use Flarum\Http\RequestUtil;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class InspectController extends AbstractController
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        RequestUtil::getActor($request)->assertAdmin();

        return new JsonResponse(array_map(function ($folder) {
            $out = shell_exec('cd ' . escapeshellarg($folder) . '&& du --max-depth=3 --bytes');

            $extensions = [];

            foreach (explode("\n", $out) as $line) {
                if (preg_match('~^([0-9]+)\s*\./([^/]+)(.*)$~', $line, $matches) !== 1) {
                    continue;
                }

                if ($matches[3] === '') {
                    // Folder size, even if it might not contain vendor or node_modules
                    $extensions[$matches[2]]['total'] = (int)$matches[1];
                } else if (in_array($matches[3], ['/vendor', '/js/node_modules', '/.git'])) {
                    $extensions[$matches[2]][str_replace(['/js/', '/.', '/'], '', $matches[3])] = (int)$matches[1];
                }
            }

            return [
                'path' => $folder,
                'extensions' => $extensions,
            ];
        }, $this->getWorkbenchFolders()));
    }
}
