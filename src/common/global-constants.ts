const host = typeof window !== 'undefined' ? window.location.host : 'default.example.com';
let tenant = host.split('.')[0];
if (host.search("ngrok") !== -1) {
  tenant = "nextlevel";
}

export class GlobalConstants {
  public static apiURL: string = "/api";
  public static tenant: string = tenant;
  public static title: string = "OWL STORE LTDA";
  public static subTitle: string = "CNPJ: 47.750.489/0001-82";
  public static email: string = "@owlstore.net.br";
  public static whatsappLink: string = "https://api.whatsapp.com/send?phone=552199999999&text=ola";
  public static razaoSocial: string = "OWL STORE LTDA";
  public static titleSigla: string = "OWL";
  public static cnpj: string = "47.750.489/0001-82";
  public static link_pdf_privacy: string = "https://download.owlstore.net.br/regulamento/SV-Regulamento.pdf";
}

if (tenant === 'legacy' || tenant === 'nextlevel' || host.search("ngrok") !== -1) {
  GlobalConstants.title = "NEXTLEVEL BRASIL";
  GlobalConstants.subTitle = "CNPJ: 50.950.769/0001-49";
  GlobalConstants.email = "@nextlevel.net.br";
  GlobalConstants.whatsappLink = "https://api.whatsapp.com/send?phone=4242141&text=test";
  GlobalConstants.razaoSocial = "NEXTLEVEL";
  GlobalConstants.titleSigla = "NTL";
  GlobalConstants.cnpj = "50.950.769/0001-49";
  GlobalConstants.link_pdf_privacy = "https://download.owlstore.net.br/regulamento/SV-Regulamento.pdf";
}
