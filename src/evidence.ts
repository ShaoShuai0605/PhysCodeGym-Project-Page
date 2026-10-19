import {artifactConfiguration, assetUrl, escapeHtml as esc, type CaseStudy} from './player';
import {modelIcon} from './icons';

export function renderPhysicalEvidence(study:CaseStudy) {
  const artifact=study.models[0];
  if(!artifact)return '<p>The physical check is not available.</p>';
  const config=artifactConfiguration(artifact);
  const evidence=artifact.evidence??study.evidence;
  const validity=artifact.scores.S_val;
  const note=(artifact.differences??study.differences).replace(/^Object and event checks pass[^.]*\.\s*/,'');

  return `<article class="physical-check" data-evidence-artifact="${esc(artifact.sha256)}" data-evidence-setting="${esc(artifact.setting)}">
    <div class="physical-check-meta">
      <p class="physical-check-model"><span class="model-identity">${modelIcon(config.model)}${esc(config.model)}</span><span>${esc(config.harness)}</span></p>
      ${typeof validity==='number'?`<p class="physical-check-validity">Original-condition validity <strong>${validity.toFixed(3)}</strong></p>`:''}
    </div>
    <p class="physical-check-finding">${esc(study.description)}</p>
    ${evidence?`<figure class="physical-check-figure">
      <img class="evidence-image" src="${assetUrl(evidence)}" alt="${esc(study.title)} — physical measurement evidence for ${esc(config.model)}" />
      ${note?`<figcaption>${esc(note)}</figcaption>`:''}
    </figure>`:'<p>Physical measurement evidence is not available.</p>'}
    <p class="physical-check-note fineprint">Original-condition physical check; independent review pending. This is not the final aggregate physical score.</p>
  </article>`;
}
