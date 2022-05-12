function IsSupersetObjectOf(supersetObject: any, subsetObject: any) {
    for (let key in subsetObject) {
        if (!(key in supersetObject) || supersetObject[key] !== subsetObject[key]) {
            return false;
        }
    }
    return true;
}

export class FormulaQuickFixesCodeActionProvider implements monaco.languages.CodeActionProvider {
    private static markerToQuickFix = new Map<any, monaco.languages.CodeAction[]>();
    public static clearMarkerQuickFixes() {
        this.markerToQuickFix.clear();
    }
    public static setMarkerQuickFix(marker: monaco.editor.IMarkerData, quickFixes: monaco.languages.CodeAction[]) {
        if (this.markerToQuickFix.has(marker)) {
            this.markerToQuickFix.set(marker, quickFixes.concat(this.markerToQuickFix.get(marker)!));
        }
        else {
            this.markerToQuickFix.set(marker, quickFixes);
        }
    }
    provideCodeActions(model: monaco.editor.ITextModel, range: monaco.Range, context: monaco.languages.CodeActionContext, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CodeActionList> {
        const actions = context.markers.flatMap(error => {
            let quickFixes = Array.from(FormulaQuickFixesCodeActionProvider.markerToQuickFix.entries()).filter(entry => IsSupersetObjectOf(error, entry[0])).flatMap(entry => entry[1]);
            if (quickFixes.length === 0) return undefined;

            quickFixes.forEach(qf => qf.diagnostics = [error]);
            quickFixes.forEach(qf => qf.edit?.edits.forEach(e => (e as monaco.languages.WorkspaceTextEdit).resource = model.uri));

            return quickFixes;
        });
        return {
            actions: actions.filter(a => a != undefined).map(a => a as monaco.languages.CodeAction),
            dispose: () => { }
        }
    }
}