<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- 1) Retorna tots els països amb àrea entre 2000 i 10000 (manté l'estructura original) -->
  <xsl:template match="/countries">
    <countries>
      <xsl:copy-of select="country[@area >= 2000 and @area <= 10000]"/>
    </countries>
  </xsl:template>
</xsl:stylesheet>