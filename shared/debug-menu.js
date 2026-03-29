(function() {
  var isEmbedded = window.parent !== window;

  // ==================== PAGE DATA ====================
  const PAGES = [
    { name: 'Digital Twin Scene', file: '../app/digital-twin-scene.html', filename: 'digital-twin-scene.html', tags: ['3d', 'viewer', 'editor', 'three.js', 'scene', 'twin', 'model', 'camera', 'undo', 'redo', 'parts'] },
    { name: 'XR App', file: '../xr/xr-app.html', filename: 'xr-app.html', tags: ['xr', 'ar', 'vr', 'mixed reality', 'camera', 'app', 'immersive', 'hololens', 'mobile'] },
  ];
  // XR screen sub-pages (shown when inside xr-app.html)
  const XR_SCREENS = [
    { name: 'XR: Login', screen: 'login', tags: ['login', 'sign in', 'auth'] },
    { name: 'XR: Lobby', screen: 'lobby', tags: ['lobby', 'home', 'main menu'] },
    { name: 'XR: Projects', screen: 'projects', tags: ['projects', 'select', 'list'] },
    { name: 'XR: Knowledge Base', screen: 'kb', tags: ['knowledge base', 'kb', 'articles', 'folders'] },
    { name: 'XR: Item View', screen: 'item', tags: ['item', 'detail', '3d', 'model'] },
    { name: 'XR: Procedure', screen: 'procedure', tags: ['procedure', 'steps', 'guide', 'workflow'] },
    { name: 'XR: Remote Support', screen: 'rs', tags: ['remote support', 'contacts', 'meetings'] },
    { name: 'XR: Call', screen: 'call', tags: ['call', 'video', 'chat', 'participants'] },
  ];
  const XR_SCREEN_ICONS = { login:'🔐', lobby:'🏠', projects:'📁', kb:'📚', item:'🔍', procedure:'📋', rs:'📞', call:'🎥' };
  const PAGE_ICONS = { 'digital-twin-scene.html':'🎬', 'xr-app.html':'🥽' };
  const currentFile = location.pathname.split('/').pop() || '';

  // ==================== FEATURES ====================
  const FEATURES = {
    'digital-twin-scene.html': [
      { id:'hotspots', name:'Hotspot System', icon:'📍',
        desc:'Create, place, and manage interactive hotspots on your 3D model — from placement to editing content, sub-hotspots, and connection lines.',
        flow:['Activate the hotspot tool','Open the Hotspot Manager','Add a new hotspot','Edit title and description','Add media and actions','Review in the manager','Add a sub-hotspot','Name the sub-hotspot','See the hierarchy','Enable connection lines','Save your work','Preview and interact in Viewer mode'],
        demo:[
          { target:'[data-menu="hotspots"]', text:'Click the Hotspot tool in the left toolbar to activate hotspot mode.', pos:'right', wait:'validate',
            validate:function(){ var b=document.querySelector('[data-menu="hotspots"]'); return b && b.classList.contains('active'); }},
          { target:'#openHsManagerSideBtn', text:'Now click the Hotspot Manager button to open the manager panel.', pos:'right', wait:'validate',
            setup:function(){ var b=document.querySelector('[data-menu="hotspots"]'); if(b&&!b.classList.contains('active')) b.click(); var sb=document.getElementById('openHsManagerSideBtn'); if(sb){ sb.style.display='flex'; demo.cleanup.push(function(){ sb.style.display=''; }); } },
            validate:function(){ var m=document.getElementById('hsManager'); return m && !m.classList.contains('hidden'); }},
          { target:'#hsManager', text:'The Hotspot Manager is now open. It lists all your hotspots with search, reorder, and bulk actions.', pos:'left', wait:'observe' },
          { target:'#hmAdd', text:'Click the + button to create a new hotspot. It will appear on the model at the center of your view.', pos:'left', wait:'validate',
            setup:function(){ demo._hsCount = document.querySelectorAll('.hs-marker').length; },
            validate:function(){ return document.querySelectorAll('.hs-marker').length > (demo._hsCount || 0); }},
          { target:'#hsEditPanel', text:'The Edit Panel opens automatically. Set the hotspot title and description here.', pos:'right', wait:'observe',
            setup:function(){ var p=document.getElementById('hsEditPanel'); if(p) p.classList.remove('hidden'); }},
          { target:'#hsEditTitle', text:'Type a name for your hotspot — this label appears on the 3D marker.', pos:'right', wait:'observe' },
          { target:'#hsAddMedia', text:'Click "Add media" to attach images or videos that users see when interacting with this hotspot.', pos:'right', wait:'observe' },
          { target:'#hsAddAction', text:'Click "Add action" to link behaviors — navigate to another hotspot, highlight parts, or start a procedure.', pos:'right', wait:'observe' },
          { target:'#hsManager', text:'Your hotspot is now in the Manager. Drag to reorder, right-click for options, or search to find hotspots.', pos:'left', wait:'observe' },
          { target:'#hmList .hm-item.selected', text:'Hover over your hotspot in the list to reveal the action buttons. Click the <b>+</b> button on the right to add a sub-hotspot underneath it.', pos:'left', wait:'validate',
            setup:function(){ demo._hsCount2 = document.querySelectorAll('.hs-marker').length; var row=document.querySelector('#hmList .hm-item.selected'); if(row){ row.scrollIntoView({block:'nearest'}); var acts=row.querySelector('.hm-item-actions'); if(acts){ acts.style.opacity='1'; demo.cleanup.push(function(){ acts.style.opacity=''; }); } } },
            validate:function(){ return document.querySelectorAll('.hs-marker').length > (demo._hsCount2 || 0); }},
          { target:'#hsEditTitle', text:'The sub-hotspot was created at the same position as its parent. Give it a name — it appears nested under its parent in the Manager.', pos:'right', wait:'observe',
            setup:function(){
              var p=document.getElementById('hsEditPanel'); if(p) p.classList.remove('hidden');
              // Offset the sub-hotspot so markers don't stack in the 3D view
              if(typeof state!=='undefined' && state.hotspots && state.hotspots.length>=2){
                var sub=state.hotspots[state.hotspots.length-1];
                var parent=state.hotspots.find(function(h){return h.id===sub.parentId;});
                if(sub.parentId && parent && sub.position3D && parent.position3D){
                  sub.position3D.x += 30; sub.position3D.z += 20;
                  if(typeof createHotspotMarkers==='function') createHotspotMarkers();
                }
              }
            }},
          { target:'#hsManager', text:'The Manager now shows a hierarchy — sub-hotspots are indented under their parent. You can drag items to reparent them.', pos:'left', wait:'observe' },
          { target:'#hmSettingsBtn', text:'Click the Settings button to access hotspot display options.', pos:'left', wait:'validate',
            setup:function(){ var m=document.getElementById('hsManager'); if(m&&m.classList.contains('hidden')){ var btn=document.getElementById('openHsManagerSideBtn'); if(btn) btn.click(); }},
            validate:function(){ var p=document.getElementById('hmSettingsPanel'); return p && p.style.display!=='none'; }},
          { target:'#hmShowLines', text:'Enable "Show lines" to display vertical connection lines beneath each hotspot marker in the 3D view.', pos:'left', wait:'validate',
            validate:function(){ var cb=document.getElementById('hmShowLines'); return cb && cb.checked; }},
          { target:'.hs-marker.show-line:not(.hs-hidden)', text:'Connection lines are now visible on the 3D markers, making hotspot positions easier to identify on the model.', pos:'top', wait:'observe', trackTip:true,            setup:function(){ var sp=document.getElementById('hmSettingsPanel'); if(sp) sp.style.display='none'; var sb=document.getElementById('hmSettingsBtn'); if(sb) sb.classList.remove('active'); var m=document.getElementById('hsManager'); if(m&&!m.classList.contains('hidden')){ var cf=typeof closeHotspotManager==='function'; if(cf) closeHotspotManager(); else m.classList.add('hidden'); } }},
          { target:'#btSave', text:'Save your work before previewing. Click Save now.', pos:'top', wait:'click' },
          { target:'#publishPrompt', text:'A publish prompt appeared. You can <b>Publish</b> to make changes live for other users, or click <b>Not now</b> to skip.', pos:'top', wait:'validate', trackTip:true,
            setup:function(){ this._seen=false; },
            validate:function(){ if(document.getElementById('publishNo')){this._seen=true;return false;} return this._seen; }},
          { target:'#btPreview', text:'Click Preview to see your hotspots as end users will experience them.', pos:'top', wait:'click' },
          { target:'.hs-marker:not(.hs-hidden)', text:'You\'re in Viewer mode. Click any hotspot marker to see its content.', pos:'top', wait:'validate', viewerMode:true, trackTip:true,            setup:function(){ var m=document.getElementById('hsManager'); if(m&&!m.classList.contains('hidden')){ var cf=typeof closeHotspotManager==='function'; if(cf) closeHotspotManager(); else m.classList.add('hidden'); } },
            validate:function(){ var p=document.getElementById('hsViewerPopup'); return p && !p.classList.contains('hidden'); }},
          { target:'#hsViewerPopup', text:'This is the Hotspot Viewer popup — exactly what users see. Title, description, media, and actions. Full hotspot workflow complete!', pos:'left', wait:'observe', viewerMode:true },
        ]},
      { id:'import-model', name:'Import 3D Model', icon:'📦',
        desc:'Import 3D model files (.fbx, .obj, .glb, .gltf, .stl) into your digital twin scene.',
        flow:['Click the + button in the bottom toolbar','Select "Import model"','Browse and select your 3D file','Model appears in the Parts Catalog','Save your work','Preview the imported model in Viewer mode'],
        demo:[
          { target:'#btAdd', text:'Click the + button in the bottom toolbar to open the add menu.', pos:'top', wait:'click' },
          { target:'#btAddImportModel', text:'Click "Import model" to browse for a 3D file (.fbx, .obj, .glb, .gltf, .stl).', pos:'right', wait:'click' },
          { target:'[data-menu="parts"]', text:'Open the Parts Catalog to see your imported model in the hierarchy.', pos:'right', wait:'validate',
            validate:function(){ var p=document.getElementById('rightPanel'); return p && !p.classList.contains('hidden'); },
            setup:function(){ var b=document.querySelector('[data-menu="parts"]'); if(b&&!b.classList.contains('active')) b.click(); }},
          { target:'#partsList', text:'Your imported model appears here in the parts tree. Click it to select it in the 3D view.', pos:'left', wait:'observe' },
          { target:'#btSave', text:'Save your work to persist the imported model. Click Save now.', pos:'top', wait:'click' },
          { target:'#btSave', text:'A publish prompt will appear. <b>Publish</b> to share with other users, or <b>Not now</b> to skip.', pos:'top', wait:'validate',
            setup:function(){ this._seen=false; },
            validate:function(){ if(document.getElementById('publishNo')){this._seen=true;return false;} return this._seen; }},
          { target:'#btPreview', text:'Click Preview to see the model in Viewer mode — exactly as end users will see it.', pos:'top', wait:'click' },
          { target:'#viewport', text:'You\'re now in Viewer mode. The imported model is visible in the scene. Orbit, pan, and zoom to inspect it. Import complete!', pos:'top', wait:'observe', viewerMode:true },
        ]},
      { id:'import-tool', name:'Import Tool from Library', icon:'🔧',
        desc:'Browse the Toolbox Library, find tools by category, and import them into your scene.',
        flow:['Click the + button in the bottom toolbar','Select "Import tool" to open the Toolbox','Browse categories or search for a tool','Select a tool to import','Save your work','Preview the scene'],
        demo:[
          { target:'#btAdd', text:'Click the + button to open the add menu.', pos:'top', wait:'click' },
          { target:'#btAddImportTool', text:'Click "Import tool" to open the Toolbox Library.', pos:'right', wait:'click' },
          { target:'#toolboxOverlay .toolbox-categories', text:'Browse tool categories on the left. Click a category to filter the tools grid.', pos:'right', wait:'observe',
            setup:function(){ var o=document.getElementById('toolboxOverlay'); if(o&&o.style.display==='none'){var b=document.getElementById('btAddImportTool'); if(b)b.click();} }},
          { target:'#toolboxSearch', text:'Type here to search tools by name. Try typing a tool name.', pos:'bottom', wait:'validate',
            validate:function(){ var el=document.getElementById('toolboxSearch'); return el && el.value.trim().length > 0; }},
          { target:'#toolboxGrid', text:'Double-click any tool card to import it into your scene. Right-click for more options: Edit, Duplicate, Info, or Delete.', pos:'left', wait:'observe' },
          { target:'#btSave', text:'After importing, save your work. Click Save.', pos:'top', wait:'click',
            setup:function(){ var o=document.getElementById('toolboxOverlay'); if(o&&o.style.display!=='none'){o.style.display='none';} }},
          { target:'#btSave', text:'A publish prompt will appear. <b>Publish</b> to share with other users, or <b>Not now</b> to skip.', pos:'top', wait:'validate',
            setup:function(){ this._seen=false; },
            validate:function(){ if(document.getElementById('publishNo')){this._seen=true;return false;} return this._seen; }},
          { target:'#btPreview', text:'Click Preview to see the tool in Viewer mode.', pos:'top', wait:'click' },
          { target:'#viewport', text:'Your imported tool is now in the scene. Viewer mode shows exactly what end users experience. Done!', pos:'top', wait:'observe', viewerMode:true },
        ]},
      { id:'parts-catalog', name:'Parts Catalog', icon:'🗂️',
        desc:'View, search, select, and manage all parts in your scene hierarchy.',
        flow:['Open the Parts Catalog from the left toolbar','Browse the parts tree','Search to filter parts','Select parts to manipulate in 3D','Toggle visibility with the eye icon'],
        demo:[
          { target:'[data-menu="parts"]', text:'Click the Parts Catalog button to open the right panel.', pos:'right', wait:'validate',
            validate:function(){ var p=document.getElementById('rightPanel'); return p && !p.classList.contains('hidden'); }},
          { target:'#rightPanel', text:'The Parts Catalog shows all parts in your scene as a tree hierarchy. Expand groups with the chevron arrows.', pos:'left', wait:'observe' },
          { target:'#partsSearch', text:'Type a part name to filter the list. The tree updates in real-time as you type.', pos:'left', wait:'validate',
            validate:function(){ var el=document.getElementById('partsSearch'); return el && el.value.trim().length > 0; }},
          { target:'#partsList', text:'Click a part to select it in the 3D view. Use Ctrl+Click to multi-select. The eye icon toggles visibility.', pos:'left', wait:'validate',
            validate:function(){ return document.querySelectorAll('.part-item.selected').length > 0; }},
          { target:'#gizmoBar', text:'With a part selected, the Gizmo Bar appears. Use Move, Rotate, or Scale to transform the part.', pos:'bottom', wait:'observe',
            setup:function(){ var g=document.getElementById('gizmoBar'); if(g) g.classList.add('visible'); }},
          { target:'#totalParts', text:'The footer shows total and selected part counts. You\'ve mastered the Parts Catalog!', pos:'left', wait:'observe' },
        ]},
      { id:'camera', name:'Camera & Navigation', icon:'🎥',
        desc:'Navigate the 3D scene with orbit, pan, zoom, and focus controls.',
        flow:['Left-drag to orbit around the model','Right-drag to pan the view','Scroll wheel to zoom in/out','Press F to focus on selection','Use the gizmo bar to Move, Rotate, or Scale parts'],
        demo:[
          { target:'#viewport', text:'Left-click + drag to orbit the camera around the model. Try orbiting now.', pos:'top', wait:'observe' },
          { target:'#viewport', text:'Right-click + drag to pan the camera. Scroll the mouse wheel to zoom in and out.', pos:'top', wait:'observe' },
          { target:'#viewport', text:'Press F to focus the camera. With a part selected it zooms to that part; with nothing selected it fits the whole scene. Try it!', pos:'top', wait:'observe' },
          { target:'[data-menu="parts"]', text:'Open the Parts Catalog and click a part to select it.', pos:'right', wait:'validate',
            validate:function(){ return document.querySelectorAll('.part-item.selected').length > 0; },
            setup:function(){ var b=document.querySelector('[data-menu="parts"]'); if(b&&!b.classList.contains('active')) b.click(); }},
          { target:'#gizmoBar', text:'The Gizmo Bar shows Move, Rotate, and Scale tools. Click one to activate it, then drag gizmo handles in the 3D view.', pos:'bottom', wait:'observe',
            setup:function(){ var g=document.getElementById('gizmoBar'); if(g) g.classList.add('visible'); }},
          { target:'.gizmo-btn[data-mode="translate"]', text:'Click Move to position the selected part. Drag the colored arrows in the viewport to translate along X, Y, or Z.', pos:'bottom', wait:'click' },
          { target:'.gizmo-btn[data-mode="rotate"]', text:'Click Rotate to spin the part. Drag the colored rings in the viewport to rotate.', pos:'bottom', wait:'click' },
          { target:'.gizmo-btn[data-mode="scale"]', text:'Click Scale to resize. Drag the colored cubes in the viewport to scale along each axis. Camera navigation complete!', pos:'bottom', wait:'click' },
        ]},
      { id:'save-preview', name:'Save & Preview', icon:'💾',
        desc:'Save your changes and preview the scene exactly as end users will experience it.',
        flow:['Click Save to persist all changes','Click Preview to enter Viewer mode','Interact with hotspots in Viewer mode','Return to Editor mode from the three-dot menu'],
        demo:[
          { target:'#btSave', text:'Click Save to persist all your changes — parts, hotspots, and settings.', pos:'top', wait:'click' },
          { target:'#btSave', text:'A publish prompt will appear. <b>Publish</b> to make them live, or <b>Not now</b> to skip.', pos:'top', wait:'validate',
            setup:function(){ this._seen=false; },
            validate:function(){ if(document.getElementById('publishNo')){this._seen=true;return false;} return this._seen; }},
          { target:'#btPreview', text:'Click Preview to enter Viewer mode. The editing UI hides and hotspots become interactive.', pos:'top', wait:'click' },
          { target:'#viewport', text:'You\'re in Viewer mode — this is exactly what end users see. Orbit, pan, and zoom to explore. Click hotspot markers to interact.', pos:'top', wait:'observe', viewerMode:true },
          { target:'#viewerMoreBtn', text:'Click the three-dot menu to access viewer options.', pos:'left', wait:'validate', viewerMode:true,
            validate:function(){ var m=document.getElementById('viewerMoreMenu'); return m && m.classList.contains('visible'); }},
          { target:'#editDTBtn', text:'Click "Edit digital twin" to return to Editor mode.', pos:'left', wait:'validate', viewerMode:true,
            validate:function(){ return typeof state!=='undefined' && state.mode==='editor'; }},
          { target:'#bottomToolbar', text:'You\'re back in Editor mode. You now know the full Save → Preview → Edit cycle!', pos:'top', wait:'observe' },
        ]},
      { id:'grid-settings', name:'Grid & Settings', icon:'⚙️',
        desc:'Toggle the reference grid and configure scene settings like title, thumbnail, and feature toggles.',
        flow:['Toggle the floor grid with the grid button','Open the editor menu','Open settings to configure the scene','Adjust title, description, and toggles'],
        demo:[
          { target:'#btGrid', text:'Click the grid button to toggle the reference grid on/off. It helps with spatial orientation.', pos:'top', wait:'click' },
          { target:'#btGrid', text:'Notice the grid toggled in the 3D view. Click again to toggle it back.', pos:'top', wait:'click' },
          { target:'#btSettings', text:'Click the gear icon to open scene settings.', pos:'top', wait:'click' },
          { target:'#leftPanel', text:'The Settings panel is now open. Configure title, description, thumbnail, default camera view, and feature toggles.', pos:'right', wait:'observe',
            setup:function(){ var p=document.getElementById('leftPanel'); if(p&&p.classList.contains('hidden')){var b=document.getElementById('btSettings'); if(b)b.click();} }},
          { target:'.panel-tab', text:'Use these tabs to switch between different setting sections.', pos:'right', wait:'observe' },
          { target:'#btSave', text:'After adjusting settings, save your changes. Click Save.', pos:'top', wait:'click' },
          { target:'#btSave', text:'A publish prompt will appear. <b>Publish</b> to share updates, or <b>Not now</b> to skip.', pos:'top', wait:'validate',
            setup:function(){ this._seen=false; },
            validate:function(){ if(document.getElementById('publishNo')){this._seen=true;return false;} return this._seen; }},
          { target:'#btPreview', text:'Preview the scene to verify your settings look correct to end users.', pos:'top', wait:'click' },
          { target:'#viewport', text:'Check that everything looks right in Viewer mode. Grid & Settings demo complete!', pos:'top', wait:'observe', viewerMode:true },
        ]},
      { id:'animations', name:'Animation Manager', icon:'🎞️',
        desc:'Create, organize, and preview animations for your digital twin parts.',
        flow:['Open the Animation Manager','Browse and search animations','Create a new animation','Preview the animation','Save your work'],
        demo:[
          { target:'#editorAnimBtn,#manageAnimBtn', text:'Click "Manage animations" to open the Animation Manager.', pos:'left', wait:'validate',
            setup:function(){
              var em=document.getElementById('editorMoreMenu'); if(em&&!em.classList.contains('visible')){var b=document.getElementById('editorMoreBtn'); if(b)b.click();}
            },
            validate:function(){ var m=document.getElementById('animManager'); return m && !m.classList.contains('hidden'); }},
          { target:'#animManager', text:'The Animation Manager shows all animations in your scene. You can search, filter, and organize them.', pos:'right', wait:'observe' },
          { target:'#animSearch', text:'Type here to search animations by name. The list filters in real-time.', pos:'bottom', wait:'observe' },
          { target:'#animAddBtn', text:'Click the + button to create a new animation. You\'ll select parts and define keyframes.', pos:'left', wait:'observe' },
          { target:'#animFilterBtn', text:'Use filters to show only animations linked to specific parts or procedures.', pos:'left', wait:'observe' },
          { target:'#btSave', text:'Save your animations. Click Save.', pos:'top', wait:'click',
            setup:function(){ var m=document.getElementById('animManager'); if(m&&!m.classList.contains('hidden')){var c=document.getElementById('animManagerClose'); if(c)c.click();} }},
          { target:'#btSave', text:'A publish prompt will appear. <b>Publish</b> to share updates, or <b>Not now</b> to skip.', pos:'top', wait:'validate',
            setup:function(){ this._seen=false; },
            validate:function(){ if(document.getElementById('publishNo')){this._seen=true;return false;} return this._seen; }},
          { target:'#btPreview', text:'Preview to see animations play as end users will experience them.', pos:'top', wait:'click' },
          { target:'#viewport', text:'Animations are now active in Viewer mode. Animation Manager demo complete!', pos:'top', wait:'observe', viewerMode:true },
        ]},
      { id:'dt-configurations', name:'Configurations', icon:'🎛️',
        desc:'Create and manage digital twin configurations — define part visibility, tags, permissions, folders, and import/export configs.',
        continueDemo:'kb-config-selection',
        flow:['Open Configurations tab','Learn about configurations','Open Create menu','Pick configuration type','Name the configuration','Add a description','Add tags','Set from view','Set permissions','Create a folder','Organize configs','Context menu actions','Search and filter','Save changes','Publish prompt','Preview in Viewer mode','See the active config','Continue to Knowledge Base'],
        demo:[
          // Step 1: Open Configurations tab — auto-advances if already active
          { target:'[data-tab="configurations"]', text:'Click the <b>Configurations</b> tab to manage digital twin variants.', pos:'right', wait:'validate',
            validate:function(){ var tab=document.querySelector('[data-tab="configurations"]'); return tab && tab.classList.contains('active'); }},
          // Step 2: Orientation
          { target:'.config-header', text:'This is the <b>Configurations</b> panel. Each configuration defines which parts are visible — perfect for machines with optional modules or regional variants.<br><br>The <b>Default Configuration</b> shows the base state of the model. It can be customized but cannot be deleted.', pos:'left', wait:'observe', requireTab:'configurations' },
          // Step 3: Click Create to open dropdown
          { target:'#cfgCreateBtn', text:'Click <b>Create</b> to open the dropdown menu.', pos:'left', wait:'validate', requireTab:'configurations',
            setup:function(){
              demo._prevCount = configData ? configData.filter(function(c){return c.type==='config';}).length : 0;
            },
            validate:function(){ var dd=document.getElementById('cfgCreateDropdown'); return dd && dd.classList.contains('show'); }},
          // Step 3b: Pick "From current view" from the dropdown
          { target:'#cfgCreateDropdown', text:'Select <b>"From current view"</b> — this captures the current 3D scene\'s part visibility as the starting state.', pos:'left', wait:'validate', requireTab:'configurations',
            validate:function(){ return configData && configData.filter(function(c){return c.type==='config';}).length > (demo._prevCount||0); }},
          // Step 4: Edit name (detail panel targets)
          { target:'#configDetailName', text:'The detail panel opened. Here you can type a name for your configuration — e.g. <b>"Standard Model"</b>.', pos:'top', wait:'observe',
            setup:function(){
              var dd = document.getElementById('cfgCreateDropdown'); if (dd) dd.classList.remove('show');
              // Ensure config detail panel is visible, positioned, and populated
              var dp = document.getElementById('configDetailPanel');
              if (dp && dp.classList.contains('hidden')) {
                dp.classList.remove('hidden');
                if (typeof renderConfigDetail === 'function') renderConfigDetail();
              }
              if (dp && (!dp.style.left || dp.style.left === 'NaNpx')) {
                dp.style.left = (window.innerWidth - 680) + 'px'; dp.style.top = '80px';
                dp.style.width = '320px'; dp.style.height = '420px';
              }
              // Re-render to ensure fields are populated
              if (typeof renderConfigDetail === 'function') renderConfigDetail();
            }},
          // Step 5: Add description
          { target:'#configDetailDesc', text:'Add a description explaining what this variant represents, e.g. <i>"Standard production model without coolant system."</i>', pos:'left', wait:'observe',
            setup:function(){
              var dp=document.getElementById('configDetailPanel');
              if(dp&&dp.classList.contains('hidden')){ dp.classList.remove('hidden'); if(typeof renderConfigDetail==='function') renderConfigDetail(); }
              var el=document.getElementById('configDetailDesc'); if(el) el.scrollIntoView({block:'nearest',behavior:'smooth'});
            }},
          // Step 6: Add tag
          { target:'#configTagAddRow', text:'Type a tag like <b>"standard"</b> and click <b>Add</b> (or press Enter). Tags help technicians find configurations by keyword.', pos:'left', wait:'observe',
            setup:function(){
              var dp=document.getElementById('configDetailPanel');
              if(dp&&dp.classList.contains('hidden')){ dp.classList.remove('hidden'); if(typeof renderConfigDetail==='function') renderConfigDetail(); }
              var el=document.getElementById('configTagInput');
              if(el) { el.scrollIntoView({block:'nearest',behavior:'smooth'}); setTimeout(function(){ el.focus(); }, 100); }
            }},
          // Step 7: Set from view
          { target:'#configSetViewBtn', text:'Click <b>"Set from View"</b> to capture the current 3D scene state into this configuration. Any parts you\'ve hidden or moved are now saved.', pos:'left', wait:'observe',
            setup:function(){
              var dp=document.getElementById('configDetailPanel');
              if(dp&&dp.classList.contains('hidden')){ dp.classList.remove('hidden'); if(typeof renderConfigDetail==='function') renderConfigDetail(); }
              var el=document.getElementById('configSetViewBtn'); if(el) el.scrollIntoView({block:'nearest',behavior:'smooth'});
            }},
          // Step 8: Permissions
          { target:'#configPermissions', text:'The <b>Permitted Roles</b> section controls which user roles can see this configuration. Uncheck roles that shouldn\'t access this variant.', pos:'left', wait:'observe',
            setup:function(){
              var dp=document.getElementById('configDetailPanel');
              if(dp&&dp.classList.contains('hidden')){ dp.classList.remove('hidden'); if(typeof renderConfigDetail==='function') renderConfigDetail(); }
              var el=document.getElementById('configPermissions'); if(el) el.scrollIntoView({block:'nearest',behavior:'smooth'});
            }},
          // Step 9: Create folder
          { target:'#cfgNewFolderBtn', text:'Click the <b>folder icon</b> to create a folder. Folders help organize configurations by region, customer, or product line.', pos:'left', wait:'validate', requireTab:'configurations',
            setup:function(){
              demo._folderCount = configData ? configData.filter(function(c){return c.type==='folder';}).length : 0;
            },
            validate:function(){ return configData && configData.filter(function(c){return c.type==='folder';}).length > (demo._folderCount||0); }},
          // Step 10: Drag to folder
          { target:'#configList', text:'<b>Drag</b> a configuration into the folder. Drop it on the folder row — you\'ll see a blue highlight when it\'s ready to receive.<br><br>You can also use the three-dot menu → <b>Move to Folder</b>.', pos:'left', wait:'observe', requireTab:'configurations' },
          // Step 11: Multi-select
          { target:'#configSelectBar', text:'Hold <b>Ctrl</b> (⌘ on Mac) and click multiple configurations to select them. The select bar shows bulk action options: Delete and Cancel.', pos:'left', wait:'observe', requireTab:'configurations' },
          // Step 12: Open context menu
          { target:'#configList .config-item:not([data-config-type="folder"]):not([data-config-id="config-default"]) [data-cfg-more]', text:'Click the <b>three-dot menu</b> (⋮) on a configuration to open the context menu.', pos:'left', wait:'validate', requireTab:'configurations',
            setup:function(){
              var items=document.querySelectorAll('#configList .config-item:not([data-config-type="folder"]):not([data-config-id="config-default"])');
              if(items.length>0){var btn=items[0].querySelector('[data-cfg-more]'); if(btn) btn.style.opacity='1';}
            },
            validate:function(){ var m=document.getElementById('configCtxMenu'); return m && m.classList.contains('show'); }},
          // Step 13: Observe context menu
          { target:'#configCtxMenu', text:'The context menu shows actions: <b>Rename</b>, <b>Duplicate</b>, <b>Copy Link</b>, <b>Move to Folder</b>, and <b>Delete</b>. Click anywhere to dismiss.', pos:'left', wait:'observe',
            setup:function(){
              var m = document.getElementById('configCtxMenu');
              if (!m || !m.classList.contains('show')) {
                var items=document.querySelectorAll('#configList .config-item:not([data-config-type="folder"]):not([data-config-id="config-default"])');
                if(items.length>0){var btn=items[0].querySelector('[data-cfg-more]'); if(btn) btn.click();}
              }
            }},
          // Step 14: Search
          { target:'#configSearchInput', text:'Type in the <b>search bar</b> to filter configurations by name or tag. Try typing a name like <b>"standard"</b>.', pos:'left', wait:'validate', requireTab:'configurations',
            setup:function(){ var m=document.getElementById('configCtxMenu'); if(m) m.classList.remove('show'); },
            validate:function(){ var el=document.getElementById('configSearchInput'); return el && el.value.trim().length > 0; }},
          // Step 15: Clear search
          { target:'#configSearchInput', text:'Clear the search to see all configurations again.', pos:'left', wait:'validate', requireTab:'configurations',
            validate:function(){ var el=document.getElementById('configSearchInput'); return el && el.value.trim().length === 0; }},
          // Step 16: Save
          { target:'#btSave', text:'Click <b>Save</b> to persist your configuration changes.', pos:'top', wait:'click',
            setup:function(){
              // Hide detail panel to unblock Save button (but don't null configSelectedId)
              var dp=document.getElementById('configDetailPanel');
              if(dp&&!dp.classList.contains('hidden')) dp.classList.add('hidden');
            }},
          // Step 16b: Wait for publish prompt to appear
          { target:'#btSave', text:'Waiting for the publish prompt...', pos:'top', wait:'appear:#publishPrompt' },
          // Step 16c: Publish prompt
          { target:'#publishPrompt', text:'A publish prompt appeared. You can <b>Publish</b> to make changes live for other users, or click <b>Not now</b> to skip.', pos:'top', wait:'validate', trackTip:true,
            setup:function(){ this._seen=false; },
            validate:function(){ if(document.getElementById('publishNo')){this._seen=true;return false;} return this._seen; }},
          // Step 17: Preview
          { target:'#btPreview', text:'Click <b>Preview</b> to switch to Viewer mode and see your configuration applied.', pos:'top', wait:'validate',
            validate:function(){ return !isInEditMode(); }},
          // Step 18: Viewer — observe with active config
          { target:'#viewport', text:'You\'re now in <b>Viewer mode</b> — this is exactly what technicians see. The digital twin is showing the <b>active configuration</b> you created. Only the parts defined in it are visible.', pos:'top', wait:'observe', viewerMode:true },
          // Step 19: Transition to KB
          { target:'#viewport', text:'Now let\'s see the full technician experience. Next, we\'ll open the <b>Knowledge Base</b> — where technicians find and launch digital twins with a <b>Configuration Selector</b>.', pos:'top', wait:'observe', viewerMode:true },
        ]},
      { id:'keyboard', name:'Keyboard Shortcuts', icon:'⌨️',
        desc:'Master the keyboard shortcuts to speed up your workflow.',
        flow:['Ctrl+Z — Undo','Ctrl+Y — Redo','F — Focus camera','Escape — Close panels','Ctrl+Click — Multi-select parts','Shift+F — Open debug menu'],
        demo:[
          { target:'#viewport', text:'Press Ctrl+Z to undo your last action, or Ctrl+Y to redo. These work for all scene modifications. Try it now!', pos:'top', wait:'observe' },
          { target:'#viewport', text:'Press F to focus the camera. With a part selected, it zooms to that part. With nothing selected, it fits the whole scene.', pos:'top', wait:'observe' },
          { target:'#bottomToolbar', text:'Press Escape to hierarchically close panels — edit panel first, then manager, then settings. Try pressing Escape.', pos:'top', wait:'observe' },
          { target:'#partsList', text:'Hold Ctrl and click parts in the catalog or 3D view to multi-select them.', pos:'left', wait:'observe',
            setup:function(){ var b=document.querySelector('[data-menu="parts"]'); if(b&&!b.classList.contains('active')) b.click(); }},
          { target:'#viewport', text:'Shift+F opens this debug menu anytime. You now know all the shortcuts!', pos:'top', wait:'observe' },
        ]},
    ],
    'xr-app.html': [
      { id:'xr-login', name:'Login & Settings', icon:'🔐',
        desc:'Log in to the XR app and configure your connection settings.',
        flow:['Open the settings panel','Configure connection settings','Enter your email','Select a login method','Arrive at the lobby'],
        demo:[
          { target:'.settings-btn', text:'Click the settings button to configure your connection before logging in.', pos:'bottom', wait:'click' },
          { target:'#login-settings', text:'The settings panel lets you configure server URL, language, and other preferences. Close it when done.', pos:'bottom', wait:'observe',
            setup:function(){ var s=document.getElementById('login-settings'); if(s&&!s.classList.contains('open')) { var b=document.querySelector('.settings-btn'); if(b)b.click(); } }},
          { target:'#email-input', text:'Enter your email address to log in.', pos:'bottom', wait:'validate',
            validate:function(){ var el=document.getElementById('email-input'); return el && el.value.trim().length > 0; }},
          { target:'.login-method', text:'Select your login method — Microsoft, Google, or email/password.', pos:'bottom', wait:'click' },
          { target:'#lobby-screen', text:'Welcome to the lobby! From here you can access Knowledge Base, Remote Support, and Immersive Room.', pos:'top', wait:'observe',
            setup:function(){ var ls=document.getElementById('login-screen'); var lb=document.getElementById('lobby-screen'); if(ls)ls.classList.remove('active'); if(lb)lb.classList.add('active'); }},
        ]},
      { id:'xr-kb', name:'Knowledge Base', icon:'📚',
        desc:'Browse projects, explore knowledge base items, and view detailed content with media.',
        flow:['Select Knowledge Base from the lobby','Choose a project','Browse KB categories','Open an item to view details','Open the side panel for media'],
        demo:[
          { target:'.lobby-card', text:'Click the Knowledge Base card to browse your organization\'s content library.', pos:'top', wait:'click',
            setup:function(){ var lb=document.getElementById('lobby-screen'); if(lb&&!lb.classList.contains('active')){lb.classList.add('active');} }},
          { target:'#projects-screen', text:'Select a project to explore its knowledge base items.', pos:'top', wait:'observe',
            setup:function(){ var ps=document.getElementById('projects-screen'); if(ps) ps.classList.add('active'); var lb=document.getElementById('lobby-screen'); if(lb) lb.classList.remove('active'); }},
          { target:'.xr-list-btn', text:'Click a category to filter the knowledge base items.', pos:'right', wait:'click' },
          { target:'#kb-items-scroll', text:'Browse the items list. Click any item to see its 3D model and details.', pos:'right', wait:'observe',
            setup:function(){ var ks=document.getElementById('kb-screen'); if(ks) ks.classList.add('active'); var ps=document.getElementById('projects-screen'); if(ps) ps.classList.remove('active'); }},
          { target:'.kb-item', text:'Click an item to open it. You\'ll see the 3D model with hotspots and detailed information.', pos:'right', wait:'click' },
          { target:'#item-screen', text:'The item view shows the 3D model with interactive hotspots. Tap hotspots to see attached content.', pos:'top', wait:'observe',
            setup:function(){ var is=document.getElementById('item-screen'); if(is) is.classList.add('active'); var ks=document.getElementById('kb-screen'); if(ks) ks.classList.remove('active'); }},
          { target:'#side-panel,.side-panel-overlay', text:'The side panel shows media, descriptions, and actions for the selected hotspot. Knowledge Base demo complete!', pos:'left', wait:'observe' },
        ]},
      { id:'xr-procedures', name:'Procedures', icon:'📋',
        desc:'Follow step-by-step guided procedures with media references and validation.',
        flow:['Open a procedure from a knowledge base item','Read the step instructions','View reference media','Navigate between steps','Complete the procedure'],
        demo:[
          { target:'#procedure-screen', text:'This is the Procedure view. Each procedure guides you through step-by-step instructions.', pos:'top', wait:'observe',
            setup:function(){ var ps=document.getElementById('procedure-screen'); if(ps) ps.classList.add('active'); }},
          { target:'#proc-text', text:'Read the current step instructions carefully. Follow them to complete the step.', pos:'bottom', wait:'observe' },
          { target:'#step-num', text:'This counter shows your progress — which step you\'re on and how many total.', pos:'bottom', wait:'observe' },
          { target:'.proc-media-btn', text:'Click the media button to view reference images, videos, or documents for this step.', pos:'bottom', wait:'click' },
          { target:'.proc-options-panel', text:'Some steps have options to choose from. Select the correct option to proceed.', pos:'right', wait:'observe' },
          { target:'.proc-nav-btn', text:'Use the navigation buttons to go forward, back, or reset the current step. Procedure demo complete!', pos:'top', wait:'observe' },
        ]},
      { id:'xr-call', name:'Remote Support & Calls', icon:'📞',
        desc:'Start a remote support call with video, chat, and participant management.',
        flow:['Open Remote Support from the lobby','Start or join a call','Use the chat panel','View participants','Use call controls'],
        demo:[
          { target:'#rs-screen', text:'This is the Remote Support screen. You can start or join calls with remote experts.', pos:'top', wait:'observe',
            setup:function(){ var rs=document.getElementById('rs-screen'); if(rs) rs.classList.add('active'); }},
          { target:'#call-screen', text:'You\'re now in a call. The main area shows the video feed.', pos:'top', wait:'observe',
            setup:function(){ var cs=document.getElementById('call-screen'); if(cs) cs.classList.add('active'); var rs=document.getElementById('rs-screen'); if(rs) rs.classList.remove('active'); }},
          { target:'#call-chat-btn', text:'Click the chat button to open the chat panel and send messages during the call.', pos:'top', wait:'validate',
            validate:function(){ var cp=document.getElementById('call-chat-panel'); return cp && cp.style.display!=='none' && !cp.classList.contains('hidden'); }},
          { target:'#call-chat-panel', text:'Type messages here to communicate with other participants via text.', pos:'left', wait:'observe' },
          { target:'#call-participants-btn', text:'Click to view all call participants and their status.', pos:'top', wait:'click' },
          { target:'.call-act-btn', text:'Use the action bar to toggle video, mute mic, enable captions, or view call info. Remote Support demo complete!', pos:'top', wait:'observe' },
        ]},
      { id:'xr-camera', name:'XR Camera & Navigation', icon:'🎥',
        desc:'Navigate the XR camera view with drag and keyboard controls.',
        flow:['Drag to pan the camera','Arrow keys for precise movement','Pinch to zoom on mobile','Back button to navigate'],
        demo:[
          { target:'#ar-space', text:'Drag to pan the camera view. On mobile, use two-finger pinch to zoom.', pos:'top', wait:'observe' },
          { target:'#direction-hint', text:'Use arrow keys (Up/Down/Left/Right) for precise fine movement. The direction hint shows available controls.', pos:'top', wait:'observe',
            setup:function(){ var d=document.getElementById('direction-hint'); if(d) d.classList.remove('hidden'); }},
          { target:'.back-btn', text:'Use the back button to navigate to the previous screen.', pos:'bottom', wait:'observe' },
          { target:'.mic-btn', text:'The microphone button activates voice commands for hands-free control. XR Navigation demo complete!', pos:'bottom', wait:'observe' },
        ]},
    ],
  };

  // ==================== TYPE CONFIG ====================
  const TYPE_COLORS = {
    page:      { bg:'#E8F0FE', color:'#2F80ED' },
    feature:   { bg:'#F3E8FF', color:'#8404B3' },
    part:      { bg:'#E8FFF0', color:'#11A855' },
    hotspot:   { bg:'#FFF3E8', color:'#D97706' },
    animation: { bg:'#FFE8E8', color:'#DC2626' },
  };
  const TYPE_LABELS = { page:'Pages', feature:'Features', part:'Parts', hotspot:'Hotspots', animation:'Animations' };

  // ==================== COMPLETION TRACKING ====================
  var COMPLETED_KEY = 'debug-demo-completed';
  function getCompleted() { try { return JSON.parse(localStorage.getItem(COMPLETED_KEY)) || {}; } catch(e) { return {}; } }
  function markCompleted(featureId) { var c = getCompleted(); c[featureId] = Date.now(); localStorage.setItem(COMPLETED_KEY, JSON.stringify(c)); }
  function isCompleted(featureId) { return !!getCompleted()[featureId]; }

  // ==================== FUZZY SEARCH ====================
  function fuzzyScore(q, t) {
    q = q.toLowerCase(); t = t.toLowerCase();
    if (t === q) return 1000;
    if (t.startsWith(q)) return 500 + (q.length / t.length) * 100;
    if (t.includes(q)) return 300 + (q.length / t.length) * 100;
    var qi = 0, s = 0, c = 0, li = -1;
    for (var i = 0; i < t.length && qi < q.length; i++) {
      if (t[i] === q[qi]) { qi++; s += 10 + c * 15; c = li === i - 1 ? c + 1 : 0; if (i === 0 || ' -|'.includes(t[i-1])) s += 20; li = i; }
    }
    return qi === q.length ? s : 0;
  }
  function hl(text, query) {
    if (!query.trim()) return text;
    var lt = text.toLowerCase(), lq = query.toLowerCase(), idx = lt.indexOf(lq);
    if (idx !== -1) return text.slice(0, idx) + '<span class="gs-hl">' + text.slice(idx, idx + query.length) + '</span>' + text.slice(idx + query.length);
    var r = '', qi = 0;
    for (var i = 0; i < text.length; i++) { if (qi < lq.length && text[i].toLowerCase() === lq[qi]) { r += '<span class="gs-hl">' + text[i] + '</span>'; qi++; } else r += text[i]; }
    return r;
  }

  // ==================== UNIFIED SEARCH ====================
  function gatherResults(query) {
    var results = [];
    var q = (query || '').trim();
    for (var pi = 0; pi < PAGES.length; pi++) {
      var p = PAGES[pi], score = 0;
      if (!q) { score = 1; } else {
        score = fuzzyScore(q, p.name);
        score = Math.max(score, fuzzyScore(q, p.file));
        for (var ti = 0; ti < p.tags.length; ti++) score = Math.max(score, fuzzyScore(q, p.tags[ti]) * 0.8);
      }
      if (score > 0) results.push({ type:'page', name:p.name, sub:p.tags.slice(0,4).join(', '), icon:PAGE_ICONS[p.file]||'📄', score:score, data:p });
    }
    // Add XR screen sub-pages when on xr-app.html
    if (currentFile === 'xr-app.html') {
      for (var si = 0; si < XR_SCREENS.length; si++) {
        var s = XR_SCREENS[si], sscore = 0;
        if (!q) { sscore = 1; } else {
          sscore = fuzzyScore(q, s.name);
          for (var sti = 0; sti < s.tags.length; sti++) sscore = Math.max(sscore, fuzzyScore(q, s.tags[sti]) * 0.8);
        }
        if (sscore > 0) results.push({ type:'page', name:s.name, sub:s.tags.join(', '), icon:XR_SCREEN_ICONS[s.screen]||'📄', score:sscore, data:{ filename:'xr-screen', screen:s.screen } });
      }
    }
    var feats = FEATURES[currentFile] || [];
    for (var fi = 0; fi < feats.length; fi++) {
      var f = feats[fi], fscore = 0;
      if (!q) { fscore = 1; } else { fscore = Math.max(fuzzyScore(q, f.name), fuzzyScore(q, f.desc) * 0.7); }
      if (fscore > 0) results.push({ type:'feature', name:f.name, sub:f.desc.slice(0,60)+(f.desc.length>60?'...':''), icon:f.icon||'✦', score:fscore, data:f });
    }
    if (typeof state !== 'undefined' && state && Array.isArray(state.parts)) {
      for (var xi = 0; xi < state.parts.length; xi++) {
        var pt = state.parts[xi], pName = pt.name || pt.id || '', pscore = 0;
        if (!q) { pscore = 1; } else { pscore = fuzzyScore(q, pName); }
        if (pscore > 0) results.push({ type:'part', name:pName, sub:pt.parentId?'Child part':'Root part', icon:'🔩', score:pscore, data:pt });
      }
    }
    if (typeof state !== 'undefined' && state && Array.isArray(state.hotspots)) {
      for (var hi = 0; hi < state.hotspots.length; hi++) {
        var h = state.hotspots[hi], hName = h.title || h.name || h.id || '', hscore = 0;
        if (!q) { hscore = 1; } else {
          hscore = fuzzyScore(q, hName);
          if (h.description) hscore = Math.max(hscore, fuzzyScore(q, h.description) * 0.6);
        }
        if (hscore > 0) results.push({ type:'hotspot', name:hName, sub:h.description?h.description.slice(0,50)+(h.description.length>50?'...':''):'Hotspot', icon:'📍', score:hscore, data:h });
      }
    }
    if (typeof animations !== 'undefined' && Array.isArray(animations)) {
      for (var ai = 0; ai < animations.length; ai++) {
        var a = animations[ai], aName = a.name || a.id || '', ascore = 0;
        if (!q) { ascore = 1; } else { ascore = fuzzyScore(q, aName); }
        if (ascore > 0) results.push({ type:'animation', name:aName, sub:a.duration?a.duration+'s':'Animation', icon:'🎞️', score:ascore, data:a });
      }
    }
    if (q) results.sort(function(a, b) { return b.score - a.score; });
    return results;
  }

  // ==================== STYLES ====================
  var S = document.createElement('style');
  var demoStyles = [
    // Guided demo
    '.gd-hl{position:fixed;z-index:99998;border-radius:8px;box-shadow:0 0 0 4000px rgba(54,65,93,.5);pointer-events:none;transition:all .35s cubic-bezier(.4,0,.2,1)}',
    '.gd-pulse{animation:gd-p 2s ease-out infinite}',
    '@keyframes gd-p{0%{box-shadow:0 0 0 4000px rgba(54,65,93,.5),0 0 0 0 rgba(47,128,237,.35)}70%{box-shadow:0 0 0 4000px rgba(54,65,93,.5),0 0 0 14px rgba(47,128,237,0)}100%{box-shadow:0 0 0 4000px rgba(54,65,93,.5),0 0 0 0 rgba(47,128,237,0)}}',
    '.gd-tip{position:fixed;z-index:99999;background:#fff;border-radius:10px;box-shadow:0 8px 32px rgba(54,65,93,.25);padding:14px 16px;width:300px;animation:gd-t .2s ease-out;pointer-events:auto}',
    '@keyframes gd-t{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    '.gd-arrow{position:absolute;width:12px;height:12px;background:#fff;transform:rotate(45deg);box-shadow:-2px -2px 4px rgba(0,0,0,.06)}',
    '.gd-step{font-size:11px;font-weight:700;color:#2F80ED;text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between}',
    '.gd-step-skip{font-size:10px;color:#868D9E;cursor:pointer;text-transform:none;font-weight:400;letter-spacing:0}',
    '.gd-step-skip:hover{color:#36415D;text-decoration:underline}',
    '.gd-text{font-size:13px;color:#36415D;line-height:1.45;margin-bottom:12px}',
    '.gd-wait{font-size:11px;color:#8404B3;font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:6px}',
    '.gd-wait::before{content:"";width:8px;height:8px;border-radius:50%;background:#8404B3;animation:gd-dot .8s ease-in-out infinite alternate}',
    '@keyframes gd-dot{from{opacity:.3;transform:scale(.8)}to{opacity:1;transform:scale(1)}}',
    '.gd-btns{display:flex;gap:8px;justify-content:flex-end}',
    '.gd-b{padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;border:none}',
    '.gd-b-sec{background:#E9E9E9;color:#36415D} .gd-b-sec:hover{background:#D9E0F0} .gd-prev{margin-right:auto}',
    '.gd-b-pri{background:#2F80ED;color:#fff} .gd-b-pri:hover{background:#5999F1}',
    '.gd-b-done{background:#11E874;color:#36415D} .gd-b-done:hover{background:#0fc964}',
    '.gd-progress{display:flex;gap:4px;margin-bottom:10px}',
    '.gd-dot-p{width:8px;height:4px;border-radius:2px;background:#E9E9E9;transition:all .2s}',
    '.gd-dot-p.done{background:#2F80ED} .gd-dot-p.current{background:#8404B3;width:20px}',
    '.gd-complete-icon{width:48px;height:48px;border-radius:50%;background:#11E874;color:#fff;font-size:24px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 12px}',
    '.gd-complete-title{font-size:16px;font-weight:700;color:#36415D;text-align:center;margin-bottom:6px}',
    '.gd-complete-desc{font-size:13px;color:#868D9E;text-align:center;margin-bottom:16px;line-height:1.45}',
  ];

  if (isEmbedded) {
    // Embedded in iframe: only inject demo styles + listen for postMessage
    S.textContent = demoStyles.join('\n');
    document.head.appendChild(S);
  } else {
    // Standalone: inject all styles (panel + demo)
    S.textContent = [
      // Overlay + panel
      '.gs-overlay{display:none;position:fixed;inset:0;background:rgba(54,65,93,.5);z-index:99999;justify-content:center;align-items:flex-start;padding-top:8vh;font-family:"Open Sans","Inter",sans-serif}',
      '.gs-overlay.gs-open{display:flex}',
      '.gs-panel{background:#fff;border-radius:12px;box-shadow:0 16px 48px rgba(54,65,93,.25);width:560px;max-width:92vw;overflow:hidden;animation:gs-in .15s ease-out;display:flex;flex-direction:column;height:76vh}',
      '@keyframes gs-in{from{opacity:0;transform:translateY(-16px) scale(.97)}to{opacity:1;transform:none}}',
      '.gs-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 12px;border-bottom:1px solid #E9E9E9;flex-shrink:0}',
      '.gs-header-left{display:flex;align-items:center;gap:10px}',
      '.gs-header-icon{width:32px;height:32px;border-radius:8px;background:#8404B3;display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff}',
      '.gs-header-title{font-size:16px;font-weight:700;color:#36415D}',
      '.gs-header-page{font-size:11px;color:#868D9E;font-weight:400;margin-left:4px}',
      '.gs-header-close{width:28px;height:28px;border:none;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:6px;color:#868D9E}',
      '.gs-header-close:hover{background:#D9E0F0;color:#36415D}',
      '.gs-header-close svg{width:14px;height:14px;fill:currentColor}',
      '.gs-search-wrap{display:flex;align-items:center;padding:10px 20px;border-bottom:1px solid #E9E9E9;gap:10px;flex-shrink:0}',
      '.gs-search-icon{color:#868D9E;flex-shrink:0}',
      '.gs-search{flex:1;border:none;outline:none;font-size:13px;font-family:inherit;color:#36415D;background:transparent}',
      '.gs-search::placeholder{color:#868D9E}',
      '.gs-filters{display:flex;gap:6px;padding:8px 20px;border-bottom:1px solid #E9E9E9;flex-shrink:0;flex-wrap:wrap}',
      '.gs-filter{padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #C2C9DB;color:#5E677D;background:#fff;font-family:inherit;transition:all .15s}',
      '.gs-filter:hover{border-color:#2F80ED;color:#2F80ED}',
      '.gs-filter.gs-filter-active{background:#2F80ED;color:#fff;border-color:#2F80ED}',
      '.gs-r-demo-count{font-size:10px;color:#868D9E;margin-left:6px;font-weight:400}',
      '.gs-r-completed{color:#11E874;font-size:14px;margin-left:4px;vertical-align:middle}',
      '.gs-r-play{width:28px;height:28px;border-radius:6px;border:none;background:none;cursor:pointer;display:none;align-items:center;justify-content:center;flex-shrink:0;color:#2F80ED}',
      '.gs-r-play:hover{background:#D9E0F0}',
      '.gs-r-play svg{width:14px;height:14px;fill:currentColor}',
      '.gs-result:hover .gs-r-play{display:flex}',
      '.gs-r-current-badge{font-size:9px;font-weight:700;background:#D9E0F0;color:#5E677D;border-radius:4px;padding:1px 6px;margin-left:6px;text-transform:uppercase;letter-spacing:.3px}',
      '.gs-results{flex:1;overflow-y:auto;padding:4px 0;min-height:0}',
      '.gs-results::-webkit-scrollbar{width:4px} .gs-results::-webkit-scrollbar-thumb{background:#c2c9db;border-radius:2px}',
      '.gs-group-label{padding:6px 20px 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#868D9E;user-select:none}',
      '.gs-result{display:flex;align-items:center;padding:9px 20px;cursor:pointer;gap:12px;transition:background .1s}',
      '.gs-result:hover,.gs-result.gs-active{background:#D9E0F0}',
      '.gs-result.gs-current{opacity:.5}',
      '.gs-r-icon{width:32px;height:32px;border-radius:8px;background:#F5F5F5;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px}',
      '.gs-r-info{flex:1;min-width:0}',
      '.gs-r-name{font-size:13px;font-weight:500;color:#36415D;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.gs-r-sub{font-size:11px;color:#868D9E;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.gs-r-type{font-size:10px;font-weight:600;border-radius:4px;padding:2px 8px;flex-shrink:0;text-transform:uppercase;letter-spacing:.3px}',
      '.gs-hl{color:#2F80ED;font-weight:600}',
      '.gs-empty{padding:24px 20px;text-align:center;color:#868D9E;font-size:13px}',
      '.gs-footer{border-top:1px solid #E9E9E9;padding:7px 20px;display:flex;gap:14px;font-size:11px;color:#868D9E;flex-shrink:0}',
      '.gs-footer kbd{display:inline-block;background:#F5F5F5;border:1px solid #C2C9DB;border-radius:3px;padding:1px 5px;font-family:inherit;font-size:10px;color:#5E677D;margin:0 2px}',
      '.gs-guide{padding:0;display:flex;flex-direction:column;flex:1;min-height:0}',
      '.gs-guide-hdr{display:flex;align-items:center;gap:12px;padding:16px 20px 12px;border-bottom:1px solid #E9E9E9;flex-shrink:0}',
      '.gs-guide-back{width:28px;height:28px;border:none;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:6px;flex-shrink:0;color:#868D9E}',
      '.gs-guide-back:hover{background:#D9E0F0;color:#36415D}',
      '.gs-guide-back svg{width:16px;height:16px;fill:currentColor}',
      '.gs-guide-icon{width:36px;height:36px;border-radius:8px;background:#F5F5F5;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}',
      '.gs-guide-info{flex:1;min-width:0}',
      '.gs-guide-name{font-size:15px;font-weight:700;color:#36415D}',
      '.gs-guide-desc{font-size:12px;color:#868D9E;margin-top:2px;line-height:1.4}',
      '.gs-guide-body{padding:16px 20px;flex:1;overflow-y:auto;min-height:0}',
      '.gs-guide-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#868D9E;margin-bottom:10px}',
      '.gs-guide-step{display:flex;gap:10px;margin-bottom:8px;align-items:flex-start}',
      '.gs-guide-num{width:22px;height:22px;border-radius:50%;background:#2F80ED;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}',
      '.gs-guide-txt{font-size:13px;color:#36415D;line-height:1.45}',
      '.gs-guide-foot{padding:12px 20px;border-top:1px solid #E9E9E9;display:flex;gap:10px;justify-content:flex-end;align-items:center;flex-shrink:0}',
      '.gs-guide-btn{padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;border:none}',
      '.gs-guide-demo{background:#2F80ED;color:#fff;display:flex;align-items:center;gap:6px}',
      '.gs-guide-demo:hover{background:#5999F1}',
      '.gs-guide-demo svg{width:14px;height:14px;fill:#fff}',
      '.gs-guide-share{background:#E9E9E9;color:#36415D;display:flex;align-items:center;gap:6px}',
      '.gs-guide-share:hover{background:#D9E0F0}',
      '.gs-guide-share svg{width:14px;height:14px;fill:#36415D}',
      '.gs-guide-share.copied{background:#11E874;color:#fff}',
      '.gs-guide-share.copied svg{fill:#fff}',
      '.gs-fab{position:fixed;bottom:20px;right:20px;width:44px;height:44px;border-radius:50%;background:#8404B3;color:#fff;border:none;cursor:pointer;z-index:99998;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(132,4,179,.35);transition:transform .15s,box-shadow .15s}',
      '.gs-fab:hover{transform:scale(1.08);box-shadow:0 6px 20px rgba(132,4,179,.45)}',
      '.gs-fab:active{transform:scale(.95)}',
      '.gs-fab svg{width:20px;height:20px;fill:currentColor}',
    ].concat(demoStyles).join('\n');
    document.head.appendChild(S);
  }

  // ==================== BUILD PANEL (standalone only) ====================
  if (isEmbedded) {
    // Embedded mode: skip panel UI, jump to demo engine + postMessage listener below
  } else {
  var pageName = '';
  for (var pi = 0; pi < PAGES.length; pi++) { if (PAGES[pi].file === currentFile) { pageName = PAGES[pi].name; break; } }

  var overlay = document.createElement('div');
  overlay.className = 'gs-overlay';
  overlay.innerHTML = '<div class="gs-panel">' +
    '<div class="gs-header">' +
      '<div class="gs-header-left">' +
        '<div class="gs-header-icon">&#9881;</div>' +
        '<div class="gs-header-title">Debug Menu' + (pageName ? '<span class="gs-header-page"> &mdash; ' + pageName + '</span>' : '') + '</div>' +
      '</div>' +
      '<button class="gs-header-close"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>' +
    '</div>' +
    '<div class="gs-search-wrap">' +
      '<svg class="gs-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5"/><line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
      '<input class="gs-search" type="text" placeholder="Search pages, features, parts, hotspots..." autofocus/>' +
    '</div>' +
    '<div class="gs-filters">' +
      '<button class="gs-filter gs-filter-active" data-filter="all">All</button>' +
      '<button class="gs-filter" data-filter="page">Pages</button>' +
      '<button class="gs-filter" data-filter="feature">Features</button>' +
      '<button class="gs-filter" data-filter="part">Parts</button>' +
      '<button class="gs-filter" data-filter="hotspot">Hotspots</button>' +
      '<button class="gs-filter" data-filter="animation">Animations</button>' +
    '</div>' +
    '<div class="gs-results"></div>' +
    '<div class="gs-footer"><span><kbd>Shift+F</kbd> toggle</span><span><kbd>&uarr;&darr;</kbd> navigate</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>' +
  '</div>';
  document.body.appendChild(overlay);

  // Floating debug button (bottom-right)
  var fab = document.createElement('button');
  fab.className = 'gs-fab';
  fab.title = 'Debug Menu (Shift+F)';
  fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>';
  document.body.appendChild(fab);
  fab.onclick = function() { if (isOpen()) closePanel(); else openPanel(); };

  overlay.querySelector('.gs-header-close').onclick = function() { closePanel(); };

  var panel = overlay.querySelector('.gs-panel');
  var searchWrap = overlay.querySelector('.gs-search-wrap');
  var sInput = overlay.querySelector('.gs-search');
  var rContainer = overlay.querySelector('.gs-results');
  var footer = overlay.querySelector('.gs-footer');
  var aIdx = 0, curResults = [], viewMode = 'search', activeFilter = 'all'; // 'search' or 'guide'
  var filtersWrap = overlay.querySelector('.gs-filters');

  // Filter tabs
  filtersWrap.addEventListener('click', function(e) {
    var btn = e.target.closest('.gs-filter');
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    filtersWrap.querySelectorAll('.gs-filter').forEach(function(b) { b.classList.toggle('gs-filter-active', b.dataset.filter === activeFilter); });
    renderResults(sInput.value);
  });

  // ==================== RENDER SEARCH RESULTS ====================
  function renderResults(q) {
    var allResults = gatherResults(q);
    curResults = activeFilter === 'all' ? allResults : allResults.filter(function(r) { return r.type === activeFilter; });
    aIdx = 0;
    // Update filter counts
    var counts = {};
    allResults.forEach(function(r) { counts[r.type] = (counts[r.type] || 0) + 1; });
    filtersWrap.querySelectorAll('.gs-filter').forEach(function(btn) {
      var f = btn.dataset.filter;
      if (f === 'all') { btn.textContent = 'All (' + allResults.length + ')'; }
      else { btn.textContent = (TYPE_LABELS[f] || f) + ' (' + (counts[f] || 0) + ')'; btn.style.display = (counts[f] || 0) === 0 ? 'none' : ''; }
    });
    if (!curResults.length) { rContainer.innerHTML = '<div class="gs-empty">No results found</div>'; return; }
    var query = (q || '').trim();
    var html = '';
    if (!query) {
      var groups = {}, typeOrder = ['page','feature','part','hotspot','animation'];
      for (var i = 0; i < curResults.length; i++) {
        var r = curResults[i];
        if (!groups[r.type]) groups[r.type] = [];
        groups[r.type].push(r);
      }
      var idx = 0;
      for (var ti = 0; ti < typeOrder.length; ti++) {
        var t = typeOrder[ti];
        if (!groups[t]) continue;
        html += '<div class="gs-group-label">' + TYPE_LABELS[t] + '</div>';
        for (var gi = 0; gi < groups[t].length; gi++) {
          html += buildResultItem(groups[t][gi], idx, query);
          idx++;
        }
      }
    } else {
      for (var si = 0; si < curResults.length; si++) {
        html += buildResultItem(curResults[si], si, query);
      }
    }
    rContainer.innerHTML = html;
  }

  function buildResultItem(r, idx, query) {
    var tc = TYPE_COLORS[r.type] || { bg:'#F5F5F5', color:'#868D9E' };
    var isCurrent = r.type === 'page' && r.data.file === currentFile;
    var hasDemo = r.type === 'feature' && r.data.demo && r.data.demo.length > 0;
    var completed = hasDemo && isCompleted(r.data.id);
    var demoCountHtml = hasDemo ? '<span class="gs-r-demo-count">' + r.data.demo.length + ' steps</span>' : '';
    var completedHtml = completed ? '<span class="gs-r-completed" title="Completed">&#10003;</span>' : '';
    var currentHtml = isCurrent ? '<span class="gs-r-current-badge">current</span>' : '';
    var playBtn = hasDemo ? '<button class="gs-r-play" data-demo-i="' + idx + '" title="Start demo"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>' : '';
    return '<div class="gs-result' + (idx === 0 ? ' gs-active' : '') + '" data-i="' + idx + '">' +
      '<div class="gs-r-icon">' + r.icon + '</div>' +
      '<div class="gs-r-info"><div class="gs-r-name">' + hl(r.name, query) + currentHtml + completedHtml + demoCountHtml + '</div>' +
      '<div class="gs-r-sub">' + hl(r.sub, query) + '</div></div>' +
      playBtn +
      '<div class="gs-r-type" style="background:' + tc.bg + ';color:' + tc.color + '">' + r.type + '</div>' +
    '</div>';
  }

  function setActive(i) {
    var items = rContainer.querySelectorAll('.gs-result'); if (!items.length) return;
    aIdx = Math.max(0, Math.min(i, items.length-1));
    items.forEach(function(e,j){ e.classList.toggle('gs-active', j===aIdx); });
    items[aIdx].scrollIntoView({block:'nearest'});
  }

  function activate(i) {
    var r = curResults[i];
    if (!r) return;
    if (r.type === 'page') {
      if (r.data.screen && typeof navigateTo === 'function') { closePanel(); navigateTo(r.data.screen); return; }
      if (r.data.filename === currentFile) { closePanel(); return; }
      window.location.href = r.data.file;
    } else if (r.type === 'feature') {
      showGuide(r.data);
    } else if (r.type === 'part') {
      closePanel();
      if (typeof onPartClick === 'function') { onPartClick(r.data); }
      else if (typeof selectPart === 'function') { selectPart(r.data.id || r.data.name); }
      else { var el = document.querySelector('[data-part-id="' + (r.data.id || '') + '"]'); if (el) el.click(); }
    } else if (r.type === 'hotspot') {
      closePanel();
      if (typeof onHotspotClick === 'function') { onHotspotClick(r.data); }
      else { var mk = document.querySelector('.hs-marker[data-hs-id="' + (r.data.id || '') + '"]'); if (mk) mk.click(); }
    } else if (r.type === 'animation') {
      closePanel();
      if (typeof openAnimManager === 'function') { openAnimManager(); }
      else { var am = document.getElementById('animManager'); if (am) am.classList.remove('hidden'); }
    }
  }

  // ==================== FEATURE GUIDE (inline in panel) ====================
  var headerEl = overlay.querySelector('.gs-header');

  function showGuide(feat) {
    viewMode = 'guide';
    searchWrap.style.display = 'none';
    filtersWrap.style.display = 'none';
    footer.style.display = 'none';
    headerEl.style.display = 'none';

    var hasDemo = feat.demo && feat.demo.length > 0;
    var guideDone = hasDemo && isCompleted(feat.id);
    var guideHtml = '<div class="gs-guide">' +
      '<div class="gs-guide-hdr">' +
        '<button class="gs-guide-back"><svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg></button>' +
        '<div class="gs-guide-icon">' + (feat.icon||'✦') + '</div>' +
        '<div class="gs-guide-info"><div class="gs-guide-name">' + feat.name + (guideDone ? ' <span style="color:#11E874;font-size:14px" title="Completed">&#10003;</span>' : '') + '</div><div class="gs-guide-desc">' + feat.desc + '</div></div>' +
      '</div>' +
      '<div class="gs-guide-body">' +
        '<div class="gs-guide-label">User Flow</div>' +
        feat.flow.map(function(s,i){ return '<div class="gs-guide-step"><div class="gs-guide-num">'+(i+1)+'</div><div class="gs-guide-txt">'+s+'</div></div>'; }).join('') +
      '</div>' +
      '<div class="gs-guide-foot">' +
        (hasDemo ? '<button class="gs-guide-btn gs-guide-share"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>Share</button>' : '') +
        (hasDemo ? '<button class="gs-guide-btn gs-guide-demo"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Start Demo (' + feat.demo.length + ' steps)</button>' : '') +
      '</div>' +
    '</div>';

    rContainer.innerHTML = guideHtml;

    rContainer.querySelector('.gs-guide-back').onclick = function() { backToSearch(); };
    if (hasDemo) {
      rContainer.querySelector('.gs-guide-share').onclick = function() { shareDemoLink(feat.id, this); };
      rContainer.querySelector('.gs-guide-demo').onclick = function() { closePanel(); startDemo(feat); };
    }
  }

  function shareDemoLink(featureId, btn) {
    var url = new URL(window.location.href);
    url.searchParams.set('demo', featureId);
    navigator.clipboard.writeText(url.toString()).then(function() {
      btn.classList.add('copied');
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Link copied!';
      setTimeout(function() {
        btn.classList.remove('copied');
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>Share';
      }, 2000);
    });
  }

  function backToSearch() {
    viewMode = 'search';
    headerEl.style.display = '';
    searchWrap.style.display = '';
    filtersWrap.style.display = '';
    footer.style.display = '';
    renderResults(sInput.value);
    requestAnimationFrame(function(){ sInput.focus(); });
  }

  // ==================== OPEN / CLOSE ====================
  function openPanel() {
    viewMode = 'search';
    activeFilter = 'all';
    filtersWrap.querySelectorAll('.gs-filter').forEach(function(b) { b.classList.toggle('gs-filter-active', b.dataset.filter === 'all'); });
    headerEl.style.display = '';
    searchWrap.style.display = '';
    filtersWrap.style.display = '';
    footer.style.display = '';
    overlay.classList.add('gs-open');
    fab.style.display = 'none';
    sInput.value = '';
    renderResults('');
    requestAnimationFrame(function(){ sInput.focus(); });
  }
  function closePanel() { overlay.classList.remove('gs-open'); fab.style.display = ''; sInput.value = ''; viewMode = 'search'; headerEl.style.display = ''; searchWrap.style.display = ''; filtersWrap.style.display = ''; footer.style.display = ''; }
  function isOpen() { return overlay.classList.contains('gs-open'); }

  // ==================== EVENT HANDLERS ====================
  sInput.addEventListener('input', function() { renderResults(sInput.value); });
  sInput.addEventListener('keydown', function(e) {
    if (e.key==='ArrowDown') { e.preventDefault(); setActive(aIdx+1); }
    else if (e.key==='ArrowUp') { e.preventDefault(); setActive(aIdx-1); }
    else if (e.key==='Enter') { e.preventDefault(); activate(aIdx); }
    else if (e.key==='Escape') { e.preventDefault(); closePanel(); }
  });
  rContainer.addEventListener('click', function(e) {
    // Quick demo play button
    var playBtn = e.target.closest('.gs-r-play');
    if (playBtn) { e.stopPropagation(); var ri = +playBtn.dataset.demoI; var r = curResults[ri]; if (r && r.data.demo) { closePanel(); startDemo(r.data); } return; }
    var it = e.target.closest('.gs-result'); if (it) activate(+it.dataset.i);
  });
  overlay.addEventListener('click', function(e) { if (e.target===overlay) closePanel(); });

  // Handle Escape in guide mode — go back to search instead of closing
  overlay.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && viewMode === 'guide') {
      e.preventDefault(); e.stopPropagation();
      backToSearch();
    }
  });
  } // end if (!isEmbedded) — panel UI

  // ==================== GUIDED DEMO ENGINE ====================
  var demo = null;

  function isEditorPage() { return currentFile === 'digital-twin-scene.html'; }
  function isInEditMode() {
    if (typeof state !== 'undefined' && state && typeof state.mode === 'string') return state.mode === 'editor';
    var bt = document.getElementById('bottomToolbar');
    return bt && !bt.classList.contains('hidden');
  }

  function startDemo(feat) {
    if (demo) endDemo();
    demo = { feat:feat, idx:0, hlEl:null, tipEl:null, cleanup:[] };
    var hlEl = document.createElement('div'); hlEl.className='gd-hl gd-pulse'; document.body.appendChild(hlEl); demo.hlEl=hlEl;
    var tip = document.createElement('div'); tip.className='gd-tip'; document.body.appendChild(tip); demo.tipEl=tip;
    // Update URL or notify parent
    if (isEmbedded) {
      window.parent.postMessage({ type: 'debugDemoStarted', featureId: feat.id }, '*');
    } else {
      var url = new URL(window.location.href);
      url.searchParams.set('demo', feat.id);
      history.replaceState(null, '', url.toString());
    }
    showStep();
  }

  function showStep() {
    if (!demo) return;
    demo.cleanup.forEach(function(fn){ fn(); }); demo.cleanup = [];
    var feat = demo.feat, idx = demo.idx;
    if (idx >= feat.demo.length) { showCompletion(); return; }
    var step = feat.demo[idx], total = feat.demo.length;

    // Edit mode gate
    if (isEditorPage() && !isInEditMode() && !step.viewerMode) {
      var moreBtn = document.getElementById('viewerMoreBtn');
      var moreMenu = document.getElementById('viewerMoreMenu');
      var menuOpen = moreMenu && moreMenu.classList.contains('visible');

      requestAnimationFrame(function() {
        if (!demo) return;
        var dots = buildDots(total, idx);

        if (!menuOpen) {
          // Ensure the more button is visible (it may have display:none in editor mode)
          if (moreBtn) {
            if (!moreBtn.classList.contains('visible')) moreBtn.classList.add('visible');
            highlightEl(moreBtn);
          } else {
            demo.hlEl.style.display = 'none';
          }
          demo.tipEl.innerHTML = dots +
            '<div class="gd-step"><span>Edit Mode Required</span><span class="gd-step-skip">skip tour</span></div>' +
            '<div class="gd-text">You\'re in Viewer mode. Click the <b>three-dot menu</b> (<b>&#8942;</b>) to open the options.</div>' +
            '<div class="gd-wait">Click the menu button to continue</div><div class="gd-btns"></div>';
          positionTip(moreBtn, 'right');
          demo.tipEl.querySelector('.gd-step-skip').addEventListener('click', function(e) { e.stopPropagation(); endDemo(); });
          var poll = setInterval(function() {
            if (!demo) { clearInterval(poll); return; }
            if (moreMenu && moreMenu.classList.contains('visible')) { clearInterval(poll); showStep(); }
          }, 200);
          demo.cleanup.push(function() { clearInterval(poll); });
        } else {
          var editBtn = document.getElementById('editDTBtn');
          if (editBtn) highlightEl(editBtn, 6); else demo.hlEl.style.display = 'none';
          demo.tipEl.innerHTML = dots +
            '<div class="gd-step"><span>Edit Mode Required</span><span class="gd-step-skip">skip tour</span></div>' +
            '<div class="gd-text">Now click <b>"Edit digital twin"</b> to switch to Editor mode and continue the demo.</div>' +
            '<div class="gd-wait">Click "Edit digital twin" to continue</div><div class="gd-btns"></div>';
          positionTip(editBtn, 'right');
          demo.tipEl.querySelector('.gd-step-skip').addEventListener('click', function(e) { e.stopPropagation(); endDemo(); });
          var poll2 = setInterval(function() {
            if (!demo) { clearInterval(poll2); return; }
            if (isInEditMode()) { clearInterval(poll2); showStep(); }
          }, 200);
          demo.cleanup.push(function() { clearInterval(poll2); });
        }
      });
      return;
    }

    // Tab context gate — if step declares requireTab, ensure that tab is active
    if (step.requireTab && isEditorPage()) {
      var reqTabBtn = document.querySelector('.panel-tab[data-tab="' + step.requireTab + '"]');
      if (reqTabBtn && !reqTabBtn.classList.contains('active')) {
        requestAnimationFrame(function() {
          if (!demo) return;
          var dots = buildDots(total, idx);
          highlightEl(reqTabBtn);
          var tabLabel = reqTabBtn.getAttribute('title') || step.requireTab;
          demo.tipEl.innerHTML = dots +
            '<div class="gd-step"><span>Navigate to ' + tabLabel + '</span><span class="gd-step-skip">skip tour</span></div>' +
            '<div class="gd-text">Click the <b>' + tabLabel + '</b> tab to continue the demo.</div>' +
            '<div class="gd-wait">Click the tab to continue</div><div class="gd-btns"></div>';
          positionTip(reqTabBtn, 'right');
          demo.tipEl.querySelector('.gd-step-skip').addEventListener('click', function(e) { e.stopPropagation(); endDemo(); });
          var poll = setInterval(function() {
            if (!demo) { clearInterval(poll); return; }
            if (reqTabBtn.classList.contains('active')) { clearInterval(poll); showStep(); }
          }, 200);
          demo.cleanup.push(function() { clearInterval(poll); });
        });
        return;
      }
    }

    if (step.setup) step.setup();

    requestAnimationFrame(function() {
      if (!demo) return;
      var targetEl = null;
      var sels = (step.target||'').split(',');
      for (var si = 0; si < sels.length; si++) {
        targetEl = document.querySelector(sels[si].trim());
        if (targetEl) break;
      }

      if (targetEl) {
        highlightEl(targetEl);
        var r = targetEl.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) targetEl.scrollIntoView({block:'center',behavior:'smooth'});
        // Dynamically track target position — re-measure each frame
        var hlSels = sels;
        var hlRaf;
        var lastTipRect = { l:0, t:0, w:0, h:0 };
        var trackHighlight = function() {
          if (!demo) return;
          var el = null;
          for (var j = 0; j < hlSels.length; j++) { el = document.querySelector(hlSels[j].trim()); if (el) break; }
          if (el) {
            highlightEl(el);
            // Reposition tooltip only when target moves (avoids per-frame DOM churn that eats clicks)
            var tr = el.getBoundingClientRect();
            if (step.trackTip || Math.abs(tr.left-lastTipRect.l)>2 || Math.abs(tr.top-lastTipRect.t)>2 || Math.abs(tr.width-lastTipRect.w)>2 || Math.abs(tr.height-lastTipRect.h)>2) {
              positionTip(el, step.pos || 'top');
              lastTipRect = { l:tr.left, t:tr.top, w:tr.width, h:tr.height };
            }
          }
          hlRaf = requestAnimationFrame(trackHighlight);
        };
        hlRaf = requestAnimationFrame(trackHighlight);
        demo.cleanup.push(function() { cancelAnimationFrame(hlRaf); });
      } else {
        demo.hlEl.style.display = 'none';
      }

      var dots = buildDots(total, idx);
      var wt = step.wait || 'observe';
      var isWait = wt === 'click' || wt === 'validate' || (typeof wt === 'string' && wt.indexOf('appear:') === 0);
      var isLast = idx === total - 1;

      var waitHtml = '';
      if (wt === 'click') waitHtml = '<div class="gd-wait">Click the highlighted element to continue</div>';
      else if (wt === 'validate') waitHtml = '<div class="gd-wait">Complete the action to continue</div>';
      else if (typeof wt === 'string' && wt.indexOf('appear:') === 0) waitHtml = '<div class="gd-wait">Waiting for element to appear...</div>';

      demo.tipEl.innerHTML = dots +
        '<div class="gd-step"><span>Step '+(idx+1)+' of '+total+'</span><span class="gd-step-skip">skip tour</span></div>' +
        '<div class="gd-text">'+step.text+'</div>' +
        waitHtml +
        '<div class="gd-btns">' +
          (idx > 0 ? '<button class="gd-b gd-b-sec gd-prev">Back</button>' : '') +
          (isWait ? '' : (isLast ? '<button class="gd-b gd-b-done gd-done">Done</button>' : '<button class="gd-b gd-b-pri gd-next">Next</button>')) +
        '</div>';

      positionTip(targetEl, step.pos || 'top');

      var nxt = demo.tipEl.querySelector('.gd-next');
      var prv = demo.tipEl.querySelector('.gd-prev');
      var dn = demo.tipEl.querySelector('.gd-done');
      var sk = demo.tipEl.querySelector('.gd-step-skip');
      if (nxt) nxt.addEventListener('click', function(e) { e.stopPropagation(); demo.idx++; showStep(); });
      if (prv) prv.addEventListener('click', function(e) { e.stopPropagation(); demo.idx--; showStep(); });
      if (dn) dn.addEventListener('click', function(e) { e.stopPropagation(); showCompletion(); });
      if (sk) sk.addEventListener('click', function(e) { e.stopPropagation(); endDemo(); });

      if (wt === 'click' && targetEl) {
        var handler = function() { demo.idx++; showStep(); };
        targetEl.addEventListener('click', handler, {once:true});
        demo.cleanup.push(function() { targetEl.removeEventListener('click', handler); });
      }
      else if (wt === 'validate' && step.validate) {
        var interval = setInterval(function() {
          if (!demo) { clearInterval(interval); return; }
          if (step.validate()) { clearInterval(interval); demo.idx++; showStep(); }
        }, 300);
        demo.cleanup.push(function() { clearInterval(interval); });
      }
      else if (typeof wt === 'string' && wt.indexOf('appear:') === 0) {
        var sel = wt.slice(7);
        var interval2 = setInterval(function() {
          if (!demo) { clearInterval(interval2); return; }
          if (document.querySelector(sel)) { clearInterval(interval2); demo.idx++; showStep(); }
        }, 300);
        demo.cleanup.push(function() { clearInterval(interval2); });
      }
    });
  }

  function buildDots(total, current) {
    var dots = '<div class="gd-progress">';
    for (var i = 0; i < total; i++) dots += '<div class="gd-dot-p'+(i<current?' done':'')+(i===current?' current':'')+'"></div>';
    return dots + '</div>';
  }

  function highlightEl(el, pad) {
    pad = pad || 8;
    var r = el.getBoundingClientRect();
    demo.hlEl.style.display = 'block';
    demo.hlEl.style.left = (r.left-pad)+'px';
    demo.hlEl.style.top = (r.top-pad)+'px';
    demo.hlEl.style.width = (r.width+pad*2)+'px';
    demo.hlEl.style.height = (r.height+pad*2)+'px';
  }

  function positionTip(el, preferredPos) {
    var tip = demo.tipEl;
    var old = tip.querySelector('.gd-arrow'); if (old) old.remove();
    var arrow = document.createElement('div'); arrow.className = 'gd-arrow';

    if (!el) { tip.style.left='50%'; tip.style.top='40%'; tip.style.transform='translate(-50%,-50%)'; tip.appendChild(arrow); return; }
    tip.style.transform = 'none';
    var r = el.getBoundingClientRect(), tw = 300, th = tip.offsetHeight || 120, gap = 18, pad = 8;
    var vw = window.innerWidth, vh = window.innerHeight;

    var space = { top: r.top, bottom: vh - r.bottom, left: r.left, right: vw - r.right };
    var needed = { top: th+gap, bottom: th+gap, left: tw+gap, right: tw+gap };
    var pos = preferredPos;
    if (space[pos] < needed[pos]) {
      pos = Object.keys(space).reduce(function(best, side) { return space[side] - needed[side] > space[best] - needed[best] ? side : best; });
    }

    var tipLeft, tipTop, arrowOffset;
    if (pos === 'top') {
      tipLeft = Math.max(pad, Math.min(r.left+r.width/2-tw/2, vw-tw-pad));
      tipTop = Math.max(pad, r.top-gap-th);
      tip.style.left = tipLeft+'px';
      tip.style.top = tipTop+'px';
      arrowOffset = Math.max(12, Math.min(r.left+r.width/2-tipLeft, tw-12));
      arrow.style.cssText = 'bottom:-6px;left:'+arrowOffset+'px;margin-left:-6px';
    } else if (pos === 'bottom') {
      tipLeft = Math.max(pad, Math.min(r.left+r.width/2-tw/2, vw-tw-pad));
      tipTop = Math.min(vh-th-pad, r.bottom+gap);
      tip.style.left = tipLeft+'px';
      tip.style.top = tipTop+'px';
      arrowOffset = Math.max(12, Math.min(r.left+r.width/2-tipLeft, tw-12));
      arrow.style.cssText = 'top:-6px;left:'+arrowOffset+'px;margin-left:-6px';
    } else if (pos === 'left') {
      tipLeft = Math.max(pad, r.left-tw-gap);
      tipTop = Math.max(pad, Math.min(r.top+r.height/2-th/2, vh-th-pad));
      tip.style.left = tipLeft+'px';
      tip.style.top = tipTop+'px';
      arrowOffset = Math.max(12, Math.min(r.top+r.height/2-tipTop-6, th-12));
      arrow.style.cssText = 'right:-6px;top:'+arrowOffset+'px';
    } else if (pos === 'right') {
      tipLeft = Math.min(vw-tw-pad, r.right+gap);
      tipTop = Math.max(pad, Math.min(r.top+r.height/2-th/2, vh-th-pad));
      tip.style.left = tipLeft+'px';
      tip.style.top = tipTop+'px';
      arrowOffset = Math.max(12, Math.min(r.top+r.height/2-tipTop-6, th-12));
      arrow.style.cssText = 'left:-6px;top:'+arrowOffset+'px';
    }
    tip.appendChild(arrow);
  }

  function getNextFeature(currentFeatId) {
    var feats = FEATURES[currentFile] || [];
    for (var i = 0; i < feats.length; i++) {
      if (feats[i].id === currentFeatId && i + 1 < feats.length && feats[i+1].demo && feats[i+1].demo.length > 0) {
        return feats[i+1];
      }
    }
    // Find first incomplete feature
    for (var j = 0; j < feats.length; j++) {
      if (feats[j].id !== currentFeatId && feats[j].demo && feats[j].demo.length > 0 && !isCompleted(feats[j].id)) {
        return feats[j];
      }
    }
    return null;
  }

  function showCompletion() {
    if (!demo) return;
    demo.cleanup.forEach(function(fn){ fn(); }); demo.cleanup = [];
    if (demo.hlEl) demo.hlEl.style.display = 'none';
    var feat = demo.feat;
    markCompleted(feat.id);
    // Continuation: if feature has continueDemo, signal parent to start that demo
    if (feat.continueDemo && isEmbedded) {
      var fid = feat.id, nextId = feat.continueDemo;
      endDemo();
      window.parent.postMessage({ type: 'debugDemoContinue', featureId: fid, nextFeatureId: nextId }, '*');
      return;
    }
    var nextFeat = getNextFeature(feat.id);
    var allDone = buildDots(feat.demo.length, feat.demo.length);
    var nextHtml = nextFeat ? '<button class="gd-b gd-b-pri gd-next-feat" style="display:flex;align-items:center;gap:5px"><span>' + nextFeat.icon + '</span> Try: ' + nextFeat.name + '</button>' : '';
    demo.tipEl.innerHTML =
      allDone +
      '<div class="gd-complete-icon">&#10003;</div>' +
      '<div class="gd-complete-title">Tutorial Complete</div>' +
      '<div class="gd-complete-desc">You\'ve completed the <b>' + feat.name + '</b> tutorial.</div>' +
      (nextFeat ? '<div style="font-size:11px;color:#868D9E;text-align:center;margin-bottom:8px">Up next</div>' : '') +
      '<div class="gd-btns" style="flex-wrap:wrap;justify-content:center">' +
        '<button class="gd-b gd-b-sec gd-restart">Show again</button>' +
        '<button class="gd-b gd-b-sec gd-share-complete"><svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:currentColor;vertical-align:-2px;margin-right:4px"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>Share</button>' +
        nextHtml +
        '<button class="gd-b gd-b-done gd-close">Done</button>' +
      '</div>';
    demo.tipEl.style.left = '50%';
    demo.tipEl.style.top = '40%';
    demo.tipEl.style.transform = 'translate(-50%, -50%)';
    demo.tipEl.querySelector('.gd-restart').addEventListener('click', function() { startDemo(feat); });
    var nextBtn = demo.tipEl.querySelector('.gd-next-feat');
    if (nextBtn && nextFeat) { nextBtn.addEventListener('click', function() { startDemo(nextFeat); }); }
    demo.tipEl.querySelector('.gd-share-complete').addEventListener('click', function() {
      var btn = this;
      var url = new URL(window.location.href);
      url.searchParams.set('demo', feat.id);
      navigator.clipboard.writeText(url.toString()).then(function() {
        btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:currentColor;vertical-align:-2px;margin-right:4px"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Copied!';
        setTimeout(function() {
          btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:currentColor;vertical-align:-2px;margin-right:4px"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>Share';
        }, 2000);
      });
    });
    demo.tipEl.querySelector('.gd-close').addEventListener('click', function() { endDemo(); });
  }

  function endDemo() {
    if (!demo) return;
    demo.cleanup.forEach(function(fn){ fn(); });
    if (demo.hlEl) demo.hlEl.remove();
    if (demo.tipEl) demo.tipEl.remove();
    demo = null;
    // Clean URL or notify parent
    if (isEmbedded) {
      window.parent.postMessage({ type: 'debugDemoEnded' }, '*');
    } else {
      var url = new URL(window.location.href);
      if (url.searchParams.has('demo')) {
        url.searchParams.delete('demo');
        history.replaceState(null, '', url.toString());
      }
    }
  }

  // ==================== GLOBAL HOTKEY ====================
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.isContentEditable) return;
    if (e.key==='Escape' && demo) { e.preventDefault(); e.stopPropagation(); endDemo(); return; }
    if (e.key==='F'&&e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey) {
      e.preventDefault(); e.stopPropagation();
      if (isEmbedded) {
        // Forward to parent so the React DebugMenu can toggle
        window.parent.postMessage({ type: 'debugToggle' }, '*');
      } else {
        if (isOpen()) closePanel(); else openPanel();
      }
    }
    if (!isEmbedded) {
      if (e.key==='Escape' && isOpen()) { e.preventDefault(); e.stopPropagation(); closePanel(); return; }
    }
  }, true);

  // ==================== POSTMESSAGE API (embedded mode) ====================
  if (isEmbedded) {
    window.addEventListener('message', function(e) {
      if (!e.data || e.data.type !== 'debugStartDemo') return;
      var featureId = e.data.featureId;
      var pageFeatures = FEATURES[currentFile] || [];
      for (var i = 0; i < pageFeatures.length; i++) {
        if (pageFeatures[i].id === featureId) {
          startDemo(pageFeatures[i]);
          return;
        }
      }
    });
    // Report available features to parent on load
    var pageFeatures = FEATURES[currentFile] || [];
    var featureList = pageFeatures.map(function(f) { return { id: f.id, name: f.name, icon: f.icon, desc: f.desc, demoSteps: f.demo ? f.demo.length : 0 }; });
    window.parent.postMessage({ type: 'debugFeatures', page: currentFile, features: featureList }, '*');
  }

  // ==================== AUTO-START FROM URL ====================
  var urlParams = new URLSearchParams(window.location.search);
  var autoDemoId = urlParams.get('demo');
  if (autoDemoId) {
    var pageFeats = FEATURES[currentFile] || [];
    for (var i = 0; i < pageFeats.length; i++) {
      if (pageFeats[i].id === autoDemoId && pageFeats[i].demo) {
        var autoFeat = pageFeats[i];
        // Delay to let the page fully render before starting
        setTimeout(function() { startDemo(autoFeat); }, 800);
        break;
      }
    }
  }
})();
