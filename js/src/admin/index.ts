import app from 'flarum/admin/app';
import Inspector from './components/Inspector';

app.initializers.add('clarkwinkelmann-workbench-cleanup', () => {
    app.extensionData
        .for('clarkwinkelmann-workbench-cleanup')
        .registerSetting(() => m(Inspector));
});
