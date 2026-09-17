<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- 2) Retorna una llista amb els elements departaments
       Aquests elements no tindran atributs i tindran Title i Chair (com a subelements) -->
  <xsl:template match="/Course_Catalog">
    <departments>
      <xsl:for-each select="Department">
        <department>
          <Title><xsl:value-of select="Title"/></Title>
          <Chair>
            <xsl:copy-of select="Chair/node()"/>
          </Chair>
        </department>
      </xsl:for-each>
    </departments>
  </xsl:template>
</xsl:stylesheet>