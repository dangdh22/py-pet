export function downloadText(fileName: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "application/octet-stream" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
