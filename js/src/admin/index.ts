import app from 'flarum/admin/app';
import Inspector from './components/Inspector';

app.initializers.add('clarkwinkelmann-workbench-cleanup', () => {
    app.extensionData
        .for('clarkwinkelmann-workbench-cleanup')
        .registerSetting(() => m(Inspector))
        .registerSetting({
            type: 'textarea',
            setting: 'workbench-cleanup.folders',
            label: 'Custom list of workbench folders',
            placeholder: 'Leave empty to scan composer.json. When customizing, one absolute path per line'
        });
});
