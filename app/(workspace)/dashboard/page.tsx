import { prisma } from '@/lib/prisma';
import DashboardVisuals from '@/components/dashboard-visuals';

const periodAt=(d:Date)=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Lima',year:'numeric',month:'2-digit'}).format(d).slice(0,7);
export default async function DashboardPage(){
 const now=new Date();const todayKey=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);const todayStart=new Date(`${todayKey}T00:00:00-05:00`);const tomorrow=new Date(todayStart.getTime()+86400000);const currentPeriod=periodAt(now);
 const [people,vacancies,todayAttendance,currentPayroll,peopleForArea,plans,weeklyAttendance,candidates,activeBenefits]=await Promise.all([
  prisma.colaborador.count({where:{estado:'Activo'}}),
  prisma.vacante.count({where:{estado:'Abierta'}}),
  prisma.asistencia.findMany({where:{fecha:{gte:todayStart,lt:tomorrow}},select:{estado:true}}),
  prisma.planilla.findUnique({where:{periodo:currentPeriod},select:{totalBruto:true,totalNeto:true,estado:true}}),
  prisma.colaborador.findMany({where:{estado:'Activo'},select:{id:true,area:{select:{nombre:true}}}}),
  prisma.planilla.findMany({orderBy:{periodo:'desc'},take:6,select:{periodo:true,totalBruto:true,totalNeto:true}}),
  prisma.asistencia.findMany({where:{fecha:{gte:new Date(todayStart.getTime()-6*86400000),lt:tomorrow}},select:{fecha:true,estado:true}}),
  prisma.postulante.findMany({select:{etapa:true}}),
  prisma.asignacionBeneficio.count({where:{vigenciaDesde:{lt:tomorrow},OR:[{vigenciaHasta:null},{vigenciaHasta:{gte:todayStart}}]}})
 ]);
 const areaCounts=new Map<string,number>();for(const p of peopleForArea){const name=p.area?.nombre||'Sin área';areaCounts.set(name,(areaCounts.get(name)||0)+1)}
 const attendanceTotal=todayAttendance.length;const present=todayAttendance.filter(a=>['Presente','Tardanza'].includes(a.estado)).length;const attendancePercent=attendanceTotal?Math.round(present/attendanceTotal*100):null;
 const dayFormat=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'});const days=new Map<string,{presentes:number;tardanzas:number;faltas:number}>();for(const r of weeklyAttendance){const key=dayFormat.format(r.fecha);const bucket=days.get(key)||{presentes:0,tardanzas:0,faltas:0};if(r.estado==='Presente')bucket.presentes++;if(r.estado==='Tardanza')bucket.tardanzas++;if(r.estado==='Falta')bucket.faltas++;days.set(key,bucket)}
 const attendanceChart=Array.from({length:7},(_,idx)=>{const date=new Date(todayStart.getTime()-(6-idx)*86400000);const key=dayFormat.format(date);return{fecha:key.slice(5),...(days.get(key)||{presentes:0,tardanzas:0,faltas:0})}});
 const funnel=['Recibido','Preseleccionado','Entrevista','Oferta','Contratado','Descartado'].map(etapa=>({etapa,total:candidates.filter(p=>p.etapa===etapa).length}));
 const payrollChart=[...plans].reverse().map(p=>({periodo:p.periodo,bruto:p.totalBruto,neto:p.totalNeto}));
 const attendanceLabel=attendancePercent===null?'Sin registros':`${attendancePercent}%`;
 return <><div className="flex flex-wrap justify-between items-end gap-3 mb-6"><div><p className="text-sm text-plomo-500">Resumen de gestión humana</p><h1 className="text-2xl font-bold mt-1">Dashboard</h1></div><div className="text-sm text-plomo-500">{new Date(`${todayKey}T12:00:00-05:00`).toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div>
 <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{[
  {name:'Colaboradores activos',value:String(people),note:'Estado Activo'},
  {name:'Vacantes abiertas',value:String(vacancies),note:'En proceso de selección'},
  {name:'Asistencia del día',value:attendanceLabel,note:attendanceTotal?`${present} de ${attendanceTotal} registros presentes o tardíos`:'Aún no hay marcaciones'},
  {name:'Planilla del mes',value:currentPayroll?`S/ ${currentPayroll.totalNeto.toLocaleString('es-PE',{minimumFractionDigits:2})}`:'Sin planilla',note:currentPayroll?`${currentPayroll.estado} · ${currentPeriod}`:currentPeriod}
 ].map((card,i)=><div className="panel p-5" key={card.name}><div className="flex justify-between items-start"><span className="text-sm text-plomo-500">{card.name}</span><span className={`w-2 h-2 rounded-full ${['bg-celeste','bg-alerta','bg-exito','bg-celeste'][i]}`}/></div><div className="text-2xl font-bold mt-3">{card.value}</div><div className="text-xs text-plomo-500 mt-2">{card.note}</div></div>)}</div>
 <DashboardVisuals areas={[...areaCounts].map(([name,total])=>({name,total}))} attendance={attendanceChart} payroll={payrollChart} funnel={funnel} benefits={activeBenefits}/>
 </>
}
