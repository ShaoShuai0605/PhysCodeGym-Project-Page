import {modelIcon, harnessIcon} from './icons';

export interface ModelArtifact {
  name: string; setting: string; job: string; trial: string; sha256: string;
  video: string; poster: string; scores: Record<string, number>; scoreNote: string;
  source?: string; differences?: string; evidence?: string; studyTitle?: string;
}
export interface CaseStudy {
  id: string; caseId: string; title: string; domain: string; kind: string;
  description: string; differences: string; source: string; reference: string;
  poster: string; models: ModelArtifact[]; evidence?: string; intervention?: boolean;
  referenceSha256?: string;
  unavailable?: (Configuration & {reason: string})[];
}
interface Configuration {model: string; harness: string; effort: string}
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const assetUrl = (path: string) => new URL(path, document.baseURI).href;
const metricNames: Record<string,string> = {S_SSIM:'SSIM', S_LPIPS:'LPIPS', S_obj:'Object', S_vis:'S_vis', S_evt:'Event', S_mot:'Motion', S_val:'Validity'};
const normalized = (s:string) => s.toLowerCase().replace(/\s*\(historical\)/g,'').replace(/[^a-z0-9]/g,'');
export function artifactConfiguration(m:ModelArtifact): Configuration {
  const parts=m.setting.split('|').map(s=>s.trim());
  const raw=parts[1] ?? '';
  const harness=({'codex':'Codex','claudecode':'Claude Code','kimicode':'Kimi Code'} as Record<string,string>)[normalized(raw)] ?? raw;
  return {model:m.name.replace(/\s*\(historical\)$/i,''),harness,effort:parts[2] ?? 'unspecified'};
}
const configKey=(c:Configuration)=>[c.model,c.harness,c.effort].map(normalized).join('|');
export function reconstructionSlots(study:CaseStudy, roster:Configuration[]) {
  const slots:{config:Configuration; artifact?:ModelArtifact}[]=[];
  const used=new Set<ModelArtifact>();
  for(const config of roster){
    const matches=study.models.filter(m=>configKey(artifactConfiguration(m))===configKey(config));
    if(matches.length)for(const artifact of matches){slots.push({config:artifactConfiguration(artifact),artifact});used.add(artifact);}
    else slots.push({config});
  }
  for(const artifact of study.models)if(!used.has(artifact))slots.push({config:artifactConfiguration(artifact),artifact});
  return slots;
}
function artifactDetails(m:ModelArtifact, study:CaseStudy, showEvidence:boolean) {
  const e=escapeHtml;
  return `<details class="artifact-details"><summary>${showEvidence?'Scores and evidence':'Scores'} <span>＋</span></summary><div class="artifact-scores">${Object.entries(m.scores).map(([key,value])=>`<div><span>${metricNames[key]??e(key)}</span><strong>${value.toFixed(3)}</strong></div>`).join('')}</div><p class="score-note fineprint">${e(m.scoreNote)}</p>${showEvidence&&m.differences?`<p class="fineprint">${e(m.differences)}</p>`:''}${showEvidence&&m.evidence?`<h4>${e(m.studyTitle??'Physical measurement evidence')}</h4><img class="evidence-image" loading="lazy" src="${assetUrl(m.evidence)}" alt="${e(m.studyTitle??study.title)} — evidence for ${e(m.name)}">`:''}<details><summary>Artifact identity and provenance <span>＋</span></summary><dl class="provenance"><dt>Task</dt><dd>${e(study.caseId)}</dd><dt>Setting</dt><dd>${e(m.setting)}</dd><dt>Job / trial</dt><dd>${e(m.job)} / ${e(m.trial)}</dd><dt>Video SHA-256</dt><dd>${e(m.sha256)}</dd><dt>Source</dt><dd>${e(m.source??study.source)}</dd></dl></details></details>`;
}
const activePlayers=new Set<SyncPlayer>();
export class SyncPlayer {
  private videos:HTMLVideoElement[];
  private toggle:HTMLButtonElement;
  private range:HTMLInputElement;
  private clock:HTMLElement;
  private status:HTMLElement;
  private abort=new AbortController();
  private frame=0;
  private operation=0;
  private wantsPlay=false;
  private duration=8;
  private disposed=false;
  private buffering=false;
  constructor(root:HTMLElement, study:CaseStudy, roster:Configuration[], evidenceArtifact?:Pick<ModelArtifact,'sha256'|'setting'>) {
    const slots=reconstructionSlots(study,roster);
    const e=escapeHtml;
    root.innerHTML=`<div class="task-player"><div class="task-overview"><div class="task-overview-copy"><p class="dialog-description">${e(study.description)}</p><p class="comparison-coverage">${study.models.length} reconstruction${study.models.length===1?'':'s'} available · ${slots.filter(s=>!s.artifact).length} without a submitted video. Model, harness, and effort are shown for each reconstruction.</p><p class="comparison-hint">Use the shared controls below to compare the reference and reconstructions at the same time.</p></div><article class="reconstruction-card reference-card"><h3>Reference</h3><p class="configuration-label">Task input · 8 seconds</p><div class="video-frame"><video muted playsinline preload="none" poster="${assetUrl(study.poster)}" data-src="${assetUrl(study.reference)}" aria-label="Reference video"></video></div></article></div><div class="player-controls"><button class="play-button" aria-label="Play all available videos">▶ <span>Play all</span></button><button class="reset-button" aria-label="Reset all videos">↺</button><input type="range" min="0" max="8" step="0.033333" value="0" aria-label="Shared video timeline"><output>0.00 / 8.00 s</output><span class="sync-indicator">SYNC</span></div><p class="player-status" role="status"></p><div class="reconstruction-grid">${slots.map(({config,artifact:m})=>`<article class="reconstruction-card${m?'':' pending-reconstruction'}"${m?` data-artifact="${m.sha256}"`:''}><h3 class="model-identity">${modelIcon(config.model)}${e(config.model)}</h3><p class="configuration-label"><span class="harness-identity">${harnessIcon(config.harness)}${e(config.harness)}</span> · ${e(config.effort)}</p>${m?`<div class="video-frame"><video muted playsinline preload="none" poster="${assetUrl(m.poster)}" data-src="${assetUrl(m.video)}" aria-label="${e(config.model)} reconstruction — ${e(config.harness)} — ${e(config.effort)}"></video></div>${artifactDetails(m,study,m.sha256===evidenceArtifact?.sha256&&m.setting===evidenceArtifact?.setting)}`:`<div class="reconstruction-placeholder" role="img" aria-label="${e(config.model)} ${e(config.harness)} reconstruction video unavailable"><span>Reconstruction</span><strong>No submitted video</strong></div>`}</article>`).join('')}</div></div>`;
    this.videos=[...root.querySelectorAll('video')];
    this.toggle=root.querySelector('.play-button')!;this.range=root.querySelector('input')!;
    this.clock=root.querySelector('output')!;this.status=root.querySelector('.player-status')!;
    const opts={signal:this.abort.signal};
    this.toggle.addEventListener('click',()=>this.wantsPlay?this.pause():void this.play(),opts);
    root.querySelector('.reset-button')!.addEventListener('click',()=>void this.seek(0),opts);
    this.range.addEventListener('input',()=>void this.seek(Number(this.range.value)),opts);
    this.videos.forEach(v=>{
      v.addEventListener('error',()=>{this.pause();this.status.textContent='A video could not load. Select Play all to retry.';},opts);
      v.addEventListener('ended',()=>{this.pause();this.update(this.duration);},opts);
    });
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause();},opts);
    activePlayers.add(this);
  }
  private async ready(v:HTMLVideoElement) {
    if(v.readyState>=2&&!v.error)return;
    await new Promise<void>((resolve,reject)=>{
      const timer=window.setTimeout(()=>{cleanup();reject(new Error('Video loading timed out'));},45000);
      const readyEvents=['loadeddata','canplay','seeked'] as const;
      const cleanup=()=>{clearTimeout(timer);readyEvents.forEach(event=>v.removeEventListener(event,done));v.removeEventListener('error',fail);this.abort.signal.removeEventListener('abort',fail);};
      const done=()=>{if(v.readyState>=2){cleanup();resolve();}};const fail=()=>{cleanup();reject(new Error('Video unavailable'));};
      readyEvents.forEach(event=>v.addEventListener(event,done));v.addEventListener('error',fail,{once:true});this.abort.signal.addEventListener('abort',fail,{once:true});
      if(!v.getAttribute('src')||v.error){v.preload='auto';v.src=v.dataset.src!;v.load();}
      done();
    });
  }
  private async readyAll(){
    await Promise.all(this.videos.map(v=>this.ready(v)));
    this.duration=Math.min(...this.videos.map(v=>Number.isFinite(v.duration)?v.duration:8));
    this.range.max=String(this.duration);
  }
  private async play(){
    activePlayers.forEach(p=>{if(p!==this)p.pause();});
    const op=++this.operation;this.wantsPlay=true;this.buttonState();this.status.textContent='Loading synchronized videos…';
    try{
      await this.readyAll();if(op!==this.operation||this.disposed)return;
      const t=this.videos[0].currentTime>=this.duration-.08?0:this.videos[0].currentTime;
      this.videos.forEach(v=>{v.currentTime=t;});
      this.status.textContent='';await this.resume();
    }catch{if(op===this.operation&&!this.disposed){this.pause();this.status.textContent='Playback did not start. Select Play all to retry.';}}
  }
  private async resume(){
    if(!this.wantsPlay||this.disposed)return;
    const results=await Promise.allSettled(this.videos.map(v=>v.play()));
    if(results.some(r=>r.status==='rejected')){this.pause();this.status.textContent='The browser could not start playback. Please retry.';return;}
    if(!this.wantsPlay){this.videos.forEach(v=>v.pause());return;}
    cancelAnimationFrame(this.frame);this.tick();
  }
  private tick=()=>{
    if(!this.wantsPlay||this.disposed)return;
    const reference=this.videos[0];
    if(this.videos.some(v=>v.readyState<3)){
      this.buffering=true;this.videos.forEach(v=>v.pause());this.status.textContent='Buffering synchronized videos…';
    }else if(this.buffering){
      this.buffering=false;this.status.textContent='';this.videos.slice(1).forEach(v=>{v.currentTime=reference.currentTime;});void this.resume();return;
    }else this.videos.slice(1).forEach(v=>{if(Math.abs(reference.currentTime-v.currentTime)>.065)v.currentTime=reference.currentTime;});
    this.update(reference.currentTime);this.frame=requestAnimationFrame(this.tick);
  };
  private update(t:number){this.range.value=String(t);this.clock.textContent=`${t.toFixed(2)} / ${this.duration.toFixed(2)} s`;}
  private buttonState(){this.toggle.innerHTML=this.wantsPlay?'Ⅱ <span>Pause all</span>':'▶ <span>Play all</span>';this.toggle.setAttribute('aria-label',this.wantsPlay?'Pause all available videos':'Play all available videos');}
  pause(){this.operation++;this.wantsPlay=false;this.buffering=false;this.videos.forEach(v=>v.pause());cancelAnimationFrame(this.frame);this.buttonState();}
  private async seek(t:number){
    this.pause();const op=this.operation;this.update(t);
    try{await this.readyAll();if(op!==this.operation||this.disposed)return;this.videos.forEach(v=>{v.currentTime=Math.min(t,this.duration-.001);});this.status.textContent='';}
    catch{if(!this.disposed)this.status.textContent='Timeline could not load. Select Play all to retry.';}
  }
  dispose(){this.pause();this.disposed=true;this.abort.abort();this.videos.forEach(v=>{v.removeAttribute('src');v.load();});activePlayers.delete(this);}
}
