import{cn}from'@/lib/utils'
export function Badge({children,variant='primary',className}:{children:React.ReactNode;variant?:'primary'|'secondary'|'sale'|'new';className?:string}){
  const v={primary:'bg-primary text-white',secondary:'bg-secondary text-white',sale:'bg-red-500 text-white',new:'bg-green-500 text-white'}
  return<span className={cn('inline-block px-2 py-1 text-xs font-bold rounded uppercase tracking-wide',v[variant],className)}>{children}</span>
}