declare module 'storejs' {
  function storejs(key: any, data: any, ...args: any[]): any;

  namespace storejs {
    function clear(): any;
    function forEach(callback: any): any;
    function get(key: any, ...args: any[]): any;
    function has(key: any): any;
    function keys(): any;
    function remove(key: any): any;
    function search(str: any): any;
    function set(key: any, val: any): any;
  }

  export = storejs;
}
