const alphabet='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const compare=(a,b)=>a<b?-1:a>b?1:0;
export function rankBetween(left='',right='',nonce=''){
 if(left&&right&&compare(left,right)>=0)throw Error('Invalid order bounds');
 for(const value of[left,right])if(value&&(!/^[0-9A-Za-z]+$/.test(value)||value.endsWith('0')))throw Error('Invalid order key');
 let prefix='',upper=right||null;
 for(let i=0;;i++){
  const low=i<left.length?alphabet.indexOf(left[i]):0,high=upper===null?62:i<upper.length?alphabet.indexOf(upper[i]):0;
  if(high-low>1)return prefix+alphabet[Math.floor((low+high)/2)]+nonce.replace(/[^0-9A-Za-z]/g,'')+'V';
  prefix+=alphabet[low];if(low<high)upper=null;
 }
}
export function boardItems(entries,boardId){const map=new Map(entries);return entries.filter(([key,item])=>key.startsWith('/items/')&&item?.boardId===boardId).map(([key,item])=>({...item,id:key.slice(7),rank:map.get('/positions/'+key.slice(7))||'',caption:map.get('/captions/'+key.slice(7))||''})).sort((a,b)=>compare(a.rank,b.rank)||compare(a.id,b.id));}
export function moveRank(items,id,targetId,after=false,nonce=''){
 const remaining=items.filter(item=>item.id!==id),target=remaining.findIndex(item=>item.id===targetId);if(target<0)return null;const index=target+Number(after);return rankBetween(remaining[index-1]?.rank,remaining[index]?.rank,nonce);
}
export function masonry(heights,width,minWidth=230,gap=16){const columns=Math.max(1,Math.floor((width+gap)/(minWidth+gap))),cardWidth=Math.max(0,(width-gap*(columns-1))/columns),bottom=Array(columns).fill(0),positions=heights.map(height=>{const column=bottom.indexOf(Math.min(...bottom)),y=bottom[column];bottom[column]=y+height+gap;return{x:column*(cardWidth+gap),y,width:cardWidth,height};});return{columns,width:cardWidth,height:Math.max(0,...bottom)- (heights.length?gap:0),positions};}
export function fileView(file){let info={};try{info=JSON.parse(file?.body||'{}');}catch{}const name=file?.source||file?.title||'Unavailable file',extension=name.split('.').length>1?name.split('.').pop().toLowerCase():'',mime=String(info.mime||'').toLowerCase(),kind=mime.startsWith('image/')||['png','jpg','jpeg','gif','webp','svg','avif','heic','heif','bmp','tif','tiff'].includes(extension)?'image':mime.startsWith('video/')||['mp4','webm','mov'].includes(extension)?'video':mime.startsWith('audio/')||['mp3','wav','m4a','ogg','flac'].includes(extension)?'audio':'file';return{name,kind,format:extension.toUpperCase()||mime.split('/').pop()?.toUpperCase()||'FILE',bytes:info.size||file?.size||0};}

export async function uploadInBatches(files,upload,attach){let total=0;for(let i=0;i<files.length;i+=12){const objects=await upload(files.slice(i,i+12));await attach(objects);total+=objects.length;}return total;}
export function boardsFromEntries(entries,{archived=false,deleted=false}={}){const values=new Map(entries),stored=entries.filter(([key])=>key.startsWith('/boards/')).map(([key,value])=>({...value,id:key.slice(8)})),boards=[{id:'main',created:0},...stored.filter(value=>value.id!=='main')];return boards.filter(value=>deleted?!!values.get('/deleted/'+value.id):!values.get('/deleted/'+value.id)&&(archived?!!value.archived:!value.archived)).map(value=>({...value,title:values.get('/titles/'+value.id)||(value.id==='main'?'Mood board':'Untitled board')})).sort((a,b)=>a.created-b.created||compare(a.id,b.id));}
export function imageFile(file){return file?.kind==='image'||fileView(file).kind==='image';}
export const IMAGE_DROP_TYPES=['image/*','.png','.jpg','.jpeg','.gif','.webp','.svg','.avif','.heic','.heif','.bmp','.tif','.tiff'];
